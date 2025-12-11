// backend/services/websocketService.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import fmpService from "./fmpService.js";
import PortfolioModel from "../models/portfolio.js";

class WebSocketService {
  constructor() {
    this.clients = new Map();              // userId -> ws connection
    this.symbolSubscriptions = new Map();  // symbol -> Set<userId>
    this.intervalIds = new Map();          // symbol or 'portfolio_<userId>' -> intervalId
  }

  // Register WebSocket route with Fastify
  initialize(fastify) {
    fastify.register(async (fastify) => {
      fastify.get("/ws", { websocket: true }, (connection, req) => {
        this.handleConnection(connection, req);
      });
    });

    console.log("🚀 WebSocket service initialized at /ws");
  }

  // Handle a new WebSocket connection
  async handleConnection(connection, req) {
    try {
      const token = this.extractToken(req);
      if (!token) {
        console.log("❌ WS connection without token");
        connection.close(1008, "Authentication required");
        return;
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log("❌ WS user not found");
        connection.close(1008, "User not found");
        return;
      }

      const userId = user._id.toString();
      console.log(`🔗 WebSocket connected: User ${userId} (${user.email})`);

      // Save connection
      this.clients.set(userId, connection);

      // Send initial connection message
      this.sendToUser(userId, {
        type: "connection_established",
        message: "WebSocket connection established",
        userId,
        timestamp: new Date().toISOString(),
      });

      // Event handlers
      connection.on("message", (data) => this.handleMessage(userId, data));
      connection.on("close", () => this.handleDisconnection(userId));
      connection.on("error", (err) => {
        console.error(`WS error for user ${userId}:`, err);
        this.handleDisconnection(userId);
      });
    } catch (err) {
      console.error("WebSocket connection error:", err);
      connection.close(1008, "Authentication failed");
    }
  }

  // Extract JWT from query or Authorization header
  extractToken(req) {
    // From query string ?token=...
    if (req.url && req.url.includes("token=")) {
      const match = req.url.match(/token=([^&]+)/);
      if (match) return match[1];
    }

    // From Authorization: Bearer ...
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }

    return null;
  }

  // Handle incoming WS messages
  handleMessage(userId, data) {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 WS message from ${userId}:`, message.type, message);

      switch (message.type) {
        case "subscribe_quotes":
          this.handleQuoteSubscription(userId, message.symbols);
          break;

        case "unsubscribe_quotes":
          this.handleQuoteUnsubscription(userId, message.symbols);
          break;

        case "subscribe_portfolio":
          this.handlePortfolioSubscription(userId);
          break;

        case "unsubscribe_portfolio":
          this.handlePortfolioUnsubscription(userId);
          break;

        case "ping":
          this.sendToUser(userId, {
            type: "pong",
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          console.warn("Unknown WS message type:", message.type);
      }
    } catch (err) {
      console.error("Error handling WS message:", err);
      this.sendToUser(userId, {
        type: "error",
        message: "Invalid message format",
      });
    }
  }

  // When a socket closes / errors
  handleDisconnection(userId) {
    console.log(`🔌 WS disconnected: User ${userId}`);
    this.unsubscribeAllSymbols(userId);
    this.stopPortfolioUpdates(userId);
    this.clients.delete(userId.toString());
  }

  // ---------- QUOTE SUBSCRIPTIONS ----------

  // Subscribe to real-time quotes
  handleQuoteSubscription(userId, symbols = []) {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      this.sendToUser(userId, {
        type: "error",
        message: "Invalid symbols array",
      });
      return;
    }

    console.log(`📊 User ${userId} subscribed to: ${symbols.join(", ")}`);

    // Track which user wants which symbols
    symbols.forEach((symbol) => {
      if (!this.symbolSubscriptions.has(symbol)) {
        this.symbolSubscriptions.set(symbol, new Set());
      }
      this.symbolSubscriptions.get(symbol).add(userId);
    });

    // Start periodic updates & send first values
    this.startQuoteUpdates(symbols);

    // Send initial quote immediately (so the UI doesn't stay on "Loading...")
    symbols.forEach(async (symbol) => {
      try {
        await this.broadcastSymbolUpdate(symbol);
      } catch (err) {
        console.error(`Error sending initial quote for ${symbol}:`, err);
      }
    });

    this.sendToUser(userId, {
      type: "subscription_confirmed",
      subscription: "quotes",
      symbols,
      message: `Subscribed to ${symbols.length} symbols`,
    });
  }

  // Unsubscribe from quotes
  handleQuoteUnsubscription(userId, symbols = []) {
  symbols.forEach((symbol) => {
    this.sendToUser(userId, {
      type: "quote_update",
      symbol: symbol,
      data: {
        symbol: symbol,
        name: symbol,
        price: 0,
        change: 0,
        changesPercentage: 0,
        timestamp: new Date().toISOString()
      }
    });
  });

    this.sendToUser(userId, {
      type: "unsubscription_confirmed",
      subscription: "quotes",
      symbols,
    });
  }

  // Start periodic quote updates for symbols
  startQuoteUpdates(symbols) {
    symbols.forEach((symbol) => {
      if (!this.intervalIds.has(symbol)) {
        const intervalId = setInterval(async () => {
          await this.broadcastSymbolUpdate(symbol);
        }, 10_000); // every 10 seconds (good for testing)

        this.intervalIds.set(symbol, intervalId);
        console.log(`🔄 Started quote updates for ${symbol}`);
      }
    });
  }

  // Stop periodic quote updates for a symbol
  stopQuoteUpdates(symbol) {
    const intervalId = this.intervalIds.get(symbol);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(symbol);
      console.log(`🛑 Stopped quote updates for ${symbol}`);
    }
  }

  // Broadcast latest quote for one symbol to all subscribed users
async broadcastSymbolUpdate(symbol) {
  try {
    const quote = await fmpService.getStockQuote(symbol);
    
    // ENSURE THE QUOTE HAS THE RIGHT STRUCTURE
    const normalizedQuote = {
      symbol: symbol,
      name: quote.name || quote.symbol || symbol,
      price: quote.price || 0,
      change: quote.change || 0,
      changesPercentage: quote.changesPercentage || 0,
      dayLow: quote.dayLow || 0,
      dayHigh: quote.dayHigh || 0,
      volume: quote.volume || 0,
      timestamp: new Date().toISOString()
    };
    
    const userSet = this.symbolSubscriptions.get(symbol);

    if (userSet && userSet.size > 0) {
      const message = {
        type: "quote_update",
        symbol: symbol,
        data: normalizedQuote,  // Use normalized data
        timestamp: new Date().toISOString(),
      };

      userSet.forEach((userId) => {
        this.sendToUser(userId, message);
      });

      console.log(`📈 Broadcast ${symbol} update to ${userSet.size} users`, normalizedQuote);
    }
  } catch (err) {
    console.error(`Error broadcasting ${symbol} update:`, err);
  }
}

  // ---------- PORTFOLIO UPDATES ----------

  // Subscribe user to portfolio updates
  handlePortfolioSubscription(userId) {
    this.startPortfolioUpdates(userId);

    this.sendToUser(userId, {
      type: "subscription_confirmed",
      subscription: "portfolio",
      message: "Portfolio updates enabled",
    });
  }

  // Unsubscribe user from portfolio updates
  handlePortfolioUnsubscription(userId) {
    this.stopPortfolioUpdates(userId);

    this.sendToUser(userId, {
      type: "unsubscription_confirmed",
      subscription: "portfolio",
    });
  }

  // Start periodic portfolio updates for a user
  startPortfolioUpdates(userId) {
    const key = `portfolio_${userId}`;
    if (!this.intervalIds.has(key)) {
      const intervalId = setInterval(async () => {
        await this.broadcastPortfolioUpdate(userId);
      }, 60_000); // every 60 seconds

      this.intervalIds.set(key, intervalId);
      console.log(`🔄 Started portfolio updates for user ${userId}`);
    }
  }

  // Stop periodic portfolio updates for a user
  stopPortfolioUpdates(userId) {
    const key = `portfolio_${userId}`;
    const intervalId = this.intervalIds.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(key);
      console.log(`🛑 Stopped portfolio updates for user ${userId}`);
    }
  }

  // Broadcast a portfolio update for a single user
  async broadcastPortfolioUpdate(userId) {
    try {
      const portfolio = await PortfolioModel.findOne({ user: userId });
      if (!portfolio) return;

      // Update portfolio values (simple recalculation)
      const updatedPortfolio = await this.updatePortfolioValues(portfolio);

      const message = {
        type: "portfolio_update",
        data: {
          totalValue: updatedPortfolio.totalValue,
          dailyChange: updatedPortfolio.performance?.totalReturn || 0,
          lastUpdated: updatedPortfolio.lastUpdated,
        },
        timestamp: new Date().toISOString(),
      };

      this.sendToUser(userId, message);
      console.log(`📊 Broadcast portfolio update for user ${userId}`);
    } catch (error) {
      console.error(
        `Error broadcasting portfolio update for user ${userId}:`,
        error
      );
    }
  }

  // Recalculate portfolio totalValue & performance (very simple version)
  async updatePortfolioValues(portfolioDoc) {
    const portfolio = portfolioDoc;

    // Calculate totalValue from investments using currentPrice
    let totalValue = 0;
    if (Array.isArray(portfolio.investments)) {
      for (const inv of portfolio.investments) {
        const qty = inv.quantity || 0;
        const price = inv.currentPrice || 0;
        totalValue += qty * price;
      }
    }

    portfolio.totalValue = Number(totalValue.toFixed(2));

    // Simple totalReturn based on initialInvestment
    const initial = portfolio.initialInvestment || 0;
    if (initial > 0) {
      const gain = portfolio.totalValue - initial;
      portfolio.performance.totalReturn = Number(
        ((gain / initial) * 100).toFixed(2)
      );
    } else {
      portfolio.performance.totalReturn = 0;
    }

    portfolio.lastUpdated = new Date();

    await portfolio.save();
    return portfolio;
  }

  // Unsubscribe a user from all symbols
  unsubscribeAllSymbols(userId) {
    for (const [symbol, userSet] of this.symbolSubscriptions.entries()) {
      userSet.delete(userId);
      if (userSet.size === 0) {
        this.symbolSubscriptions.delete(symbol);
        this.stopQuoteUpdates(symbol);
      }
    }
  }

  // Send a message to one user
  sendToUser(userId, message) {
    const connection = this.clients.get(userId.toString());
    if (connection && connection.readyState === 1) {
      try {
        connection.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
        this.handleDisconnection(userId);
      }
    }
  }

  // Broadcast message to all connected users
  broadcast(message) {
    this.clients.forEach((connection, userId) => {
      if (connection.readyState === 1) {
        try {
          connection.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error broadcasting to user ${userId}:`, error);
        }
      }
    });
  }

  // For debugging / monitoring
  getStats() {
    return {
      totalConnections: this.clients.size,
      symbolSubscriptions: this.symbolSubscriptions.size,
      activeIntervals: this.intervalIds.size,
    };
  }
}

export default new WebSocketService();

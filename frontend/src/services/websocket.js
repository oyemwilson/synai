// src/services/websocket.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.pingInterval = null;
    this.messageQueue = [];
    this.isConnecting = false;
    this.currentToken = null;
  }

  connect(token) {
    // Prevent multiple simultaneous connections
    if (this.isConnecting) {
      console.log("⚠️ Already connecting...");
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("⚠️ WebSocket already connected");
      return;
    }

    // Close any existing connection first
    if (this.ws) {
      console.log("🔄 Closing existing connection before reconnecting");
      this.ws.close();
      this.ws = null;
    }

    this.currentToken = token;
    this.isConnecting = true;
    
    const wsUrl = `ws://localhost:4000/ws?token=${token}`;
    console.log("🔗 Connecting to WebSocket:", wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit("connection_change", { state: "connected" });
        this.startPingInterval();
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("📨 WebSocket message received:", message.type, message);

          // Emit the event type so listeners can handle it
          this.emit(message.type, message);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.isConnecting = false;
        this.emit("connection_change", { state: "error" });
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        this.isConnecting = false;
        this.stopPingInterval();
        this.emit("connection_change", { state: "disconnected" });

        // Auto-reconnect logic (only if we have a token and haven't exceeded max attempts)
        if (this.currentToken && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Will reconnect in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            if (this.currentToken) {
              this.connect(this.currentToken);
            }
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error("❌ Error creating WebSocket:", error);
      this.isConnecting = false;
      this.emit("connection_change", { state: "error" });
    }
  }

  disconnect() {
    console.log("🔌 Disconnecting WebSocket...");
    this.currentToken = null; // Clear token to prevent reconnection
    this.stopPingInterval();
    
    if (this.ws) {
      // Remove event listeners to prevent reconnection attempts
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
    
    this.messageQueue = [];
    console.log("✅ WebSocket disconnected");
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        console.log("📤 Sent message:", message.type);
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    } else {
      console.warn("⚠️ WebSocket not ready, queuing message:", message.type);
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    console.log(`📦 Flushing ${this.messageQueue.length} queued messages`);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    console.log(`👂 Registered listener for: ${event}`);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      console.log(`🔇 Removed listener for: ${event}`);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    console.log(`📢 Emitting ${event} to ${callbacks.length} listeners`);
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in ${event} listener:`, error);
      }
    });
  }

  // Subscription methods
  subscribeToQuotes(symbols) {
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    console.log("📊 Subscribing to quotes:", symbolArray);
    this.send({
      type: "subscribe_quotes",
      symbols: symbolArray,
    });
    return true;
  }

  unsubscribeFromQuotes(symbols) {
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    console.log("📊 Unsubscribing from quotes:", symbolArray);
    this.send({
      type: "unsubscribe_quotes",
      symbols: symbolArray,
    });
    return true;
  }

  subscribeToPortfolio() {
    console.log("💼 Subscribing to portfolio updates");
    this.send({
      type: "subscribe_portfolio",
    });
    return true;
  }

  unsubscribeFromPortfolio() {
    console.log("💼 Unsubscribing from portfolio updates");
    this.send({
      type: "unsubscribe_portfolio",
    });
    return true;
  }

  // Ping/pong to keep connection alive
  startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: "ping" });
      }
    }, 30000); // Every 30 seconds
    console.log("💓 Started ping interval");
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      console.log("💔 Stopped ping interval");
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState() {
    if (!this.ws) return WebSocket.CLOSED;
    return this.ws.readyState;
  }
}

// Export a single instance
export const websocketService = new WebSocketService();
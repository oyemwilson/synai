// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback, useRef } from "react";
import { websocketService } from "../services/websocket";
import { useAuth } from "./useAuth";
import axios from "axios";

export const useWebSocket = () => {
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState("disconnected");
  const [realTimeQuotes, setRealTimeQuotes] = useState({});
  const [portfolioUpdate, setPortfolioUpdate] = useState(null);
  
  // Refs to track initialization
  const hasConnectedRef = useRef(false);
  const handlersRegisteredRef = useRef(false);

  const getToken = () => {
    if (typeof window === "undefined") return null;

    // Direct keys
    const directKeys = ["token", "accessToken", "authToken"];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (val) return val;
    }

    // JSON blobs
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === "object" && parsed.token) {
          return parsed.token;
        }
      } catch {
        // ignore
      }
    }

    const authHeader = axios.defaults.headers.common?.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }

    return null;
  };

  // Register event handlers ONCE
  useEffect(() => {
    if (handlersRegisteredRef.current) {
      console.log("⚠️ Handlers already registered, skipping...");
      return;
    }

    console.log("✅ Registering WebSocket event handlers");
    handlersRegisteredRef.current = true;

    // connection_change handler
    const handleConnectionChange = (data) => {
      console.log("🔄 Connection state changed:", data.state);
      setConnectionState(data.state);
    };

    // quote_update handler
    const handleQuoteUpdate = (message) => {
      console.log("🔥 QUOTE_UPDATE received:", message);
      
      const symbol = message.symbol;
      const raw = message.data;
      
      if (!symbol || !raw) {
        console.warn("⚠️ Invalid quote update:", message);
        return;
      }

      const quote = {
        symbol,
        name: raw.name || raw.symbol || symbol,
        price: raw.price ?? 0,
        change: raw.change ?? 0,
        changesPercentage: raw.changesPercentage ?? 0,
        dayLow: raw.dayLow,
        dayHigh: raw.dayHigh,
        volume: raw.volume,
        timestamp: raw.timestamp || new Date(),
      };

      console.log("📊 Updating quote for:", symbol, quote);

      setRealTimeQuotes((prev) => {
        const updated = {
          ...prev,
          [symbol]: quote,
        };
        console.log("✅ Updated realTimeQuotes state:", updated);
        return updated;
      });
    };

    // portfolio_update handler
    const handlePortfolioUpdate = (message) => {
      console.log("💼 Portfolio update received:", message);
      setPortfolioUpdate(message.data || null);
    };

    // Register all handlers
    websocketService.on("connection_change", handleConnectionChange);
    websocketService.on("quote_update", handleQuoteUpdate);
    websocketService.on("portfolio_update", handlePortfolioUpdate);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up WebSocket event handlers");
      websocketService.off("connection_change", handleConnectionChange);
      websocketService.off("quote_update", handleQuoteUpdate);
      websocketService.off("portfolio_update", handlePortfolioUpdate);
      handlersRegisteredRef.current = false;
    };
  }, []); // Empty deps - only run once

  // Connect/disconnect based on token
  useEffect(() => {
    const token = getToken();
    console.log("🔑 Token check - user:", !!user, "token:", !!token, "hasConnected:", hasConnectedRef.current);

    if (token) {
      if (!websocketService.isConnected() && !hasConnectedRef.current) {
        console.log("🔗 Connecting WebSocket...");
        hasConnectedRef.current = true;
        websocketService.connect(token);
      } else {
        console.log("⚠️ WebSocket already connected or connecting");
      }
    } else {
      console.log("🔌 No token, disconnecting...");
      hasConnectedRef.current = false;
      websocketService.disconnect();
      setConnectionState("disconnected");
      setRealTimeQuotes({});
      setPortfolioUpdate(null);
    }

    // Don't disconnect on cleanup - let the token check handle it
  }, [user]);

  // Subscription methods
  const subscribeToQuotes = useCallback((symbols) => {
    console.log("📝 subscribeToQuotes called with:", symbols);
    return websocketService.subscribeToQuotes(symbols);
  }, []);

  const unsubscribeFromQuotes = useCallback((symbols) => {
    console.log("📝 unsubscribeFromQuotes called with:", symbols);
    return websocketService.unsubscribeFromQuotes(symbols);
  }, []);

  const subscribeToPortfolio = useCallback(() => {
    console.log("📝 subscribeToPortfolio called");
    return websocketService.subscribeToPortfolio();
  }, []);

  const unsubscribeFromPortfolio = useCallback(() => {
    console.log("📝 unsubscribeFromPortfolio called");
    return websocketService.unsubscribeFromPortfolio();
  }, []);

  return {
    connectionState,
    realTimeQuotes,
    portfolioUpdate,
    subscribeToQuotes,
    unsubscribeFromQuotes,
    subscribeToPortfolio,
    unsubscribeFromPortfolio,
    isConnected: websocketService.isConnected(),
  };
};
// src/screens/market/RealTimeQuotes.jsx
import React, { useEffect, useRef } from "react";
import { useWebSocketContext } from "../../contexts/WebSocketContext";

export const RealTimeQuotes = ({ symbols = [] }) => {
  const {
    realTimeQuotes,
    subscribeToQuotes,
    unsubscribeFromQuotes,
    connectionState,
    isConnected,
  } = useWebSocketContext();

  const subscribedRef = useRef([]);

  // Debug: see what we have
  useEffect(() => {
    console.log("🔍 RealTimeQuotes - symbols:", symbols);
    console.log("🔍 RealTimeQuotes - realTimeQuotes:", realTimeQuotes);
    console.log("🔍 RealTimeQuotes - connectionState:", connectionState);
    console.log("🔍 RealTimeQuotes - isConnected:", isConnected);
  }, [symbols, realTimeQuotes, connectionState, isConnected]);

  // Subscribe/unsubscribe when symbols change
  useEffect(() => {
    const prev = subscribedRef.current || [];
    const next = symbols || [];

    console.log("📡 Subscription effect - prev:", prev, "next:", next);

    if (next.length === 0) {
      if (prev.length > 0) {
        console.log("🔕 Unsubscribing from all:", prev);
        unsubscribeFromQuotes(prev);
      }
      subscribedRef.current = [];
      return;
    }

    const added = next.filter((s) => !prev.includes(s));
    const removed = prev.filter((s) => !next.includes(s));

    console.log("📡 Added symbols:", added);
    console.log("📡 Removed symbols:", removed);

    if (added.length > 0) {
      console.log("✅ Subscribing to:", added);
      subscribeToQuotes(added);
    }
    if (removed.length > 0) {
      console.log("❌ Unsubscribing from:", removed);
      unsubscribeFromQuotes(removed);
    }

    subscribedRef.current = next;
  }, [symbols, subscribeToQuotes, unsubscribeFromQuotes]);

  // Unsubscribe everything on unmount
  useEffect(() => {
    return () => {
      if (subscribedRef.current.length > 0) {
        console.log("🧹 Cleanup: unsubscribing from:", subscribedRef.current);
        unsubscribeFromQuotes(subscribedRef.current);
      }
    };
  }, [unsubscribeFromQuotes]);

  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (change) => {
    if (change > 0) return "↗";
    if (change < 0) return "↘";
    return "→";
  };

  const formatNumber = (value, decimals = 2) => {
    if (value == null || isNaN(value)) return "0.00";
    return Number(value).toFixed(decimals);
  };

const getQuoteForSymbol = (symbol) => {
  console.log(`🔎 Looking for quote for symbol: "${symbol}"`);
  console.log("🔎 Available quotes:", realTimeQuotes);
  
  if (!realTimeQuotes || typeof realTimeQuotes !== 'object') {
    console.log("❌ realTimeQuotes is not an object or is null");
    return null;
  }

  const symbolUpper = symbol.toUpperCase();
  
  // Try different keys
  const possibleKeys = [
    symbolUpper,
    symbolUpper.split(".")[0],  // Without extension
    symbol,  // Original
    symbol.toLowerCase()
  ];
  
  for (const key of possibleKeys) {
    if (realTimeQuotes[key]) {
      console.log(`✅ Found quote for ${symbol} using key: ${key}`, realTimeQuotes[key]);
      return realTimeQuotes[key];
    }
  }
  
  console.log(`❌ No quote found for ${symbol}`);
  return null;
};

  if (!symbols || symbols.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Real-Time Quotes
          </h3>
        </div>
        <div className="px-4 py-6 text-sm text-gray-500">
          Add symbols to your watchlist to see live quotes here.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Real-Time Quotes
        </h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-500">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {symbols.map((symbol) => {
          const quote = getQuoteForSymbol(symbol);

          return (
            <div
              key={symbol}
              className="px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {symbol}
                    </span>
                    {quote?.name && (
                      <span className="text-sm text-gray-500 truncate max-w-[140px]">
                        {quote.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {quote ? (
                    <>
                      <div className="font-semibold text-gray-900">
                        ${formatNumber(quote.price)}
                      </div>
                      <div
                        className={`text-sm ${getChangeColor(
                          quote.change
                        )}`}
                      >
                        <span className="mr-1">
                          {getChangeIcon(quote.change)}
                        </span>
                        {formatNumber(quote.change)} (
                        {formatNumber(quote.changesPercentage)}%)
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Loading...
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 bg-gray-50 border-t text-xs font-mono text-gray-600">
          <div>Connection: {connectionState}</div>
          <div>Quotes in state: {Object.keys(realTimeQuotes).length}</div>
          <div>Subscribed: {subscribedRef.current.join(", ")}</div>
        </div>
      )}
    </div>
  );
};
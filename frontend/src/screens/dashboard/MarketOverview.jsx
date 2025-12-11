import React, { useState, useEffect, useCallback, useRef } from "react";
import { marketAPI } from "../../services/api";
import { LoadingSpinner } from "../common/LoadingSpinner";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
} from "lucide-react";

export const MarketOverview = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);      // hard error (no data)
  const [softError, setSoftError] = useState(null); // background refresh error
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);
  const refreshInterval = useRef(null);

  const fetchMarketOverview = useCallback(
    async (isInitial = false, isManual = false) => {
      if (isInitial && hasFetched.current) return;

      try {
        if (isInitial) {
          setLoading(true);
          setError(null);
        } else if (isManual) {
          setRefreshing(true);
        }

        const response = await marketAPI.getMarketOverview();
        setMarketData(response.data);
        setError(null);
        setSoftError(null);

        if (isInitial) {
          hasFetched.current = true;
        }
      } catch (err) {
        console.error("Error fetching market overview:", err);
        const message = err?.message || "Failed to load market data";

        if (isInitial && !marketData) {
          setError(message);
        } else {
          setSoftError(message);
        }
      } finally {
        if (isInitial) {
          setLoading(false);
        } else if (isManual) {
          setRefreshing(false);
        }
      }
    },
    [marketData]
  );

  useEffect(() => {
    fetchMarketOverview(true);

    refreshInterval.current = setInterval(() => {
      fetchMarketOverview(false);
    }, 5 * 60 * 1000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchMarketOverview]);

  const getSentimentConfig = useCallback((sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "bullish":
        return {
          color: "text-green-700 bg-gradient-to-r from-green-50 to-green-100",
          border: "border-green-200",
          icon: TrendingUp,
        };
      case "bearish":
        return {
          color: "text-red-700 bg-gradient-to-r from-red-50 to-red-100",
          border: "border-red-200",
          icon: TrendingDown,
        };
      default:
        return {
          color:
            "text-yellow-700 bg-gradient-to-r from-yellow-50 to-yellow-100",
          border: "border-yellow-200",
          icon: Activity,
        };
    }
  }, []);

  const getChangeColor = useCallback((change) => {
    if (change > 0) return "text-green-600 bg-green-50";
    if (change < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  }, []);

  const formatPrice = useCallback((price) => {
    if (price == null || isNaN(price)) return "N/A";
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const formatPercentage = useCallback((percentage) => {
    if (percentage == null || isNaN(percentage)) return "0.00";
    return percentage.toFixed(2);
  }, []);

  const getIndexLabel = useCallback((key, index) => {
    const symbol = index?.symbol || key;

    const labelsBySymbol = {
      "^GSPC": "S&P 500",
      "^DJI": "Dow Jones",
      "^IXIC": "NASDAQ",
      "^RUT": "Russell 2000",
      "^VIX": "VIX",
    };

    return labelsBySymbol[symbol] || labelsBySymbol[key] || symbol || key;
  }, []);

  // ====== Loading state ======
  if (loading && !marketData) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
        <LoadingSpinner text="Loading market data..." />
      </div>
    );
  }

  // ====== Hard error (no data) ======
  if (error && !marketData) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold text-lg mb-2">
            {error || "Market data unavailable"}
          </p>
          <button
            onClick={() => {
              hasFetched.current = false;
              fetchMarketOverview(true, true);
            }}
            className="mt-3 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sentimentConfig = getSentimentConfig(
    marketData?.marketSentiment?.description
  );
  const SentimentIcon = sentimentConfig.icon;
  const indices = marketData?.indices || {};

  // ====== Main UI ======
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 sm:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Market Overview
            </h2>
            <p className="text-gray-300 text-sm">
              Major indices snapshot from FMP
            </p>
            {softError && (
              <p className="mt-2 text-xs text-yellow-300/80 max-w-xs">
                Couldn&apos;t refresh latest data. Showing last known values.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {marketData.marketSentiment && (
              <span
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border ${sentimentConfig.color} ${sentimentConfig.border} flex items-center gap-2 shadow-sm`}
              >
                <SentimentIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {marketData.marketSentiment.description}
                </span>
              </span>
            )}
            <button
              onClick={() => fetchMarketOverview(false, true)}
              disabled={refreshing}
              className="self-start sm:self-auto p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-5 h-5 text-white ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Indices Grid */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(indices).map(([key, index]) => {
            const isPositive = index.changesPercentage > 0;
            const isNegative = index.changesPercentage < 0;
            const label = getIndexLabel(key, index);
            const isVix =
              index.symbol === "^VIX" ||
              key.toUpperCase().includes("VIX") ||
              label.toUpperCase().includes("VIX");

            return (
              <div
                key={key}
                className="relative group bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-0 sm:hover:-translate-y-1"
              >
                {/* Hover background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  {/* Label */}
                  <div className="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wide truncate">
                    {label}
                  </div>

                  {/* Price */}
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {isVix
                      ? formatPrice(index.price)
                      : `$${formatPrice(index.price)}`}
                  </div>

                  {/* Change */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold ${getChangeColor(
                        index.changesPercentage
                      )}`}
                    >
                      {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
                      {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
                      {isPositive && "+"}
                      {formatPercentage(index.changesPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>
              Updated:{" "}
              {marketData.timestamp
                ? new Date(marketData.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "Just now"}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Auto-refresh: 5 min
          </span>
        </div>
      </div>
    </div>
  );
};

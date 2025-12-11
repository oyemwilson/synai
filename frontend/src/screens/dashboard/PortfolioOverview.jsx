import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useWebSocketContext } from "../../contexts/WebSocketContext";
import { LoadingSpinner } from "../common/LoadingSpinner";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  RefreshCw,
  AlertCircle,
  Activity,
  PieChart,
  Shield,
} from "lucide-react";

// ================== Helpers ==================

const riskLevelConfig = {
  conservative: {
    label: "Conservative",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  aggressive: {
    label: "Aggressive",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

const getChangeBadgeClasses = (change) => {
  if (change > 0) return "text-green-700 bg-green-50 border-green-200";
  if (change < 0) return "text-red-700 bg-red-50 border-red-200";
  return "text-gray-700 bg-gray-50 border-gray-200";
};

const getChangeTextColor = (change) => {
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-gray-600";
};

const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatPercentage = (value) => {
  const num = Number.isFinite(value) ? value : 0;
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
};

// Turn your assetAllocation + metrics.assetAllocation into a neat list for UI
const buildAllocationSegments = (portfolio) => {
  const metricsAlloc = portfolio?.metrics?.assetAllocation;
  const alloc = portfolio?.assetAllocation;

  // Prefer metrics.assetAllocation if available (has value + percentage)
  if (metricsAlloc && Object.keys(metricsAlloc).length > 0) {
    return Object.entries(metricsAlloc).map(([key, val]) => ({
      key,
      label: key.toUpperCase(),
      percentage: val.percentage ?? 0,
      value: val.value ?? 0,
    }));
  }

  if (!alloc) return [];

  const entries = [
    { key: "stocks", label: "Stocks", value: alloc.stocks || 0 },
    { key: "bonds", label: "Bonds", value: alloc.bonds || 0 },
    { key: "etfs", label: "ETFs", value: alloc.etfs || 0 },
    {
      key: "cryptocurrencies",
      label: "Crypto",
      value: alloc.cryptocurrencies || 0,
    },
    { key: "realEstate", label: "Real Estate", value: alloc.realEstate || 0 },
    { key: "cash", label: "Cash", value: alloc.cash || 0 },
    { key: "other", label: "Other", value: alloc.other || 0 },
  ];

  const total = entries.reduce((sum, e) => sum + e.value, 0) || 1;

  return entries
    .map((e) => ({
      key: e.key,
      label: e.label,
      value: e.value,
      percentage: (e.value / total) * 100,
    }))
    .filter((e) => e.value > 0 || e.percentage > 0);
};

const allocationColors = {
  stocks: "bg-blue-500",
  stock: "bg-blue-500",   // for metrics data

  bonds: "bg-yellow-500",

  etfs: "bg-indigo-500",
  etf: "bg-indigo-500",   // for metrics data

  cryptocurrencies: "bg-purple-500",
  crypto: "bg-purple-500",

  realEstate: "bg-green-500",
  real_estate: "bg-green-500",

  cash: "bg-gray-400",
  other: "bg-pink-500",
};



// ================== Component ==================

export const PortfolioOverview = () => {
  const { portfolio, fetchPortfolio, loading, error } = usePortfolio();
  const { portfolioUpdate } = useWebSocketContext();

  const hasFetched = useRef(false);
  const [localPortfolio, setLocalPortfolio] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPortfolio = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      await fetchPortfolio();
    } catch {
      // error handled via hook
    }
  }, [fetchPortfolio]);

  // Initial fetch
  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Sync local with main portfolio
  useEffect(() => {
    if (portfolio) {
      setLocalPortfolio(portfolio);
    }
  }, [portfolio]);

  // WebSocket patch updates
  useEffect(() => {
    if (!portfolioUpdate) return;

    setLocalPortfolio((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...portfolioUpdate,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [portfolioUpdate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      hasFetched.current = false;
      await loadPortfolio();
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayPortfolio = localPortfolio || portfolio;

  // ===== Derived values based on your schema & sample =====
  const currency = displayPortfolio?.currency || "USD";

  const totalValue =
    displayPortfolio?.metrics?.totalValue ?? displayPortfolio?.totalValue ?? 0;

  const totalReturnPercent =
    displayPortfolio?.performance?.totalReturn ??
    displayPortfolio?.metrics?.totalReturn ??
    0;

  const initialInvestment = displayPortfolio?.initialInvestment ?? 0;
  const absoluteReturn = totalValue - initialInvestment;

  const holdingsCount =
    displayPortfolio?.metrics?.investmentCount ??
    displayPortfolio?.investments?.length ??
    0;

  const dailyChange =
    displayPortfolio?.performance?.dailyChange ??
    displayPortfolio?.metrics?.dailyChange ??
    0;

  const allocationSegments = buildAllocationSegments(displayPortfolio);
  const riskLevel = displayPortfolio?.riskLevel || "moderate";
  const riskConfig =
    riskLevelConfig[riskLevel] || riskLevelConfig["moderate"];

  const lastUpdated =
    displayPortfolio?.metrics?.lastUpdated || displayPortfolio?.lastUpdated;

  const riskScore = displayPortfolio?.analytics?.overallRiskScore?.score;
  const riskLabel = displayPortfolio?.analytics?.overallRiskScore?.level;

  const isPositive = totalReturnPercent > 0;
  const isNegative = totalReturnPercent < 0;

  // ====== loading state ======
  if (loading && !displayPortfolio) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8">
        <LoadingSpinner text="Loading portfolio..." />
      </div>
    );
  }

  // ====== error state ======
  if (error && !displayPortfolio) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold text-lg mb-2">
            Error loading portfolio
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {error.message || "Something went wrong while fetching your data."}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ====== empty state ======
  if (!displayPortfolio || holdingsCount === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-dashed border-indigo-200 p-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex gap-3 items-start">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                No investments yet
              </h2>
              <p className="text-sm text-gray-600 max-w-md">
                Add your first stock, ETF, or crypto to start tracking your
                portfolio in real time. You’ll see performance, allocation and
                risk analytics here.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // ====== main content ======
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {displayPortfolio?.name || "My Portfolio"}
              </h2>
              <p className="text-indigo-100 text-sm">
                Real-time performance & allocation view
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Risk badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${riskConfig.color}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${riskConfig.dot}`}
              ></span>
              <span>Risk: {riskConfig.label}</span>
              {riskScore != null && (
                <span className="text-[10px] text-gray-500">
                  ({riskScore.toFixed(1)} / 100
                  {riskLabel ? ` • ${riskLabel}` : ""})
                </span>
              )}
            </div>

            {/* Live / last updated */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_0_4px_rgba(16,185,129,0.5)]" />
              <span className="text-xs text-white font-medium">
                {lastUpdated
                  ? `Updated ${new Date(lastUpdated).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}`
                  : "Live via WebSocket"}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-xs font-medium text-white hover:bg-white/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-8">
        {/* Top row: value + metrics */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Left: Value & total return */}
          <div>
            <div className="flex items-baseline gap-3 mb-3">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                {formatCurrency(totalValue, currency)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Total return badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getChangeBadgeClasses(
                  totalReturnPercent
                )}`}
              >
                {isPositive && <TrendingUp className="w-4 h-4" />}
                {isNegative && <TrendingDown className="w-4 h-4" />}
                <span className={getChangeTextColor(totalReturnPercent)}>
                  {formatPercentage(totalReturnPercent)} total return
                </span>
              </div>

              {/* Absolute return */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-700">
                <Activity className="w-3 h-3 text-indigo-600" />
                <span className="font-medium">
                  {absoluteReturn >= 0 ? "Gain" : "Loss"}:{" "}
                  {formatCurrency(Math.abs(absoluteReturn), currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: small metric cards */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 flex items-center gap-2 min-w-[170px]">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Initial Investment
                </div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(initialInvestment, currency)}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 flex items-center gap-2 min-w-[170px]">
              <Activity className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Daily Change
                </div>
                <div
                  className={`font-semibold ${getChangeTextColor(
                    dailyChange
                  )}`}
                >
                  {formatPercentage(dailyChange)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle row: cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em]">
                Holdings
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {holdingsCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Active positions in your portfolio
            </div>
          </div>

          {/* Risk / Analytics */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em]">
                Risk & Analytics
              </div>
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Risk level</span>
                <span className="font-medium capitalize">
                  {riskLevel.replace("-", " ")}
                </span>
              </div>
              {riskScore != null && (
                <div className="flex justify-between">
                  <span>Overall risk score</span>
                  <span className="font-medium">
                    {riskScore.toFixed(1)} / 100
                    {riskLabel ? ` (${riskLabel})` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Allocation */}
{/* Allocation block */}
<div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg">
  <div className="flex items-center justify-between mb-3">
    <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em]">
      Asset Allocation
    </div>
    <div className="p-2 bg-emerald-50 rounded-lg">
      <PieChart className="w-4 h-4 text-emerald-600" />
    </div>
  </div>

  {allocationSegments.length === 0 ? (
    <p className="text-xs text-gray-500">
      Allocation data will appear here as we calculate it from your positions.
    </p>
  ) : (
    <>
      {/* Colored bar */}
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-3 flex">
        {allocationSegments.map((segment) => (
          <div
            key={segment.key}
            style={{ width: `${segment.percentage}%` }}
            className={`h-full ${
              (allocationColors[segment.key] ||
                allocationColors[segment.label.toLowerCase()] ||
                "bg-gray-300")
            }`}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {allocationSegments.slice(0, 6).map((segment) => (
          <div key={segment.key} className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700">
              {segment.label}
            </span>
            <span className="text-xs text-gray-500">
              {segment.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </>
  )}
</div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-500">
          <span>
            Portfolio data updates automatically via WebSocket. Refresh if
            you’ve made changes elsewhere.
          </span>
          <span>
            Last sync:{" "}
            {lastUpdated
              ? new Date(lastUpdated).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now"}
          </span>
        </div>
      </div>
    </div>
  );
};

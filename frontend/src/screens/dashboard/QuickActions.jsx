import React from "react";
import { Link } from "react-router-dom";
import { usePortfolio } from "../../hooks/usePortfolio";
import { ArrowRight } from "lucide-react";

export const QuickActions = () => {
  const { portfolio } = usePortfolio();

  // Use actual data shape: investments[] or metrics.investmentCount
  const investmentCount =
    portfolio?.metrics?.investmentCount ??
    portfolio?.investments?.length ??
    0;

  const hasHoldings = investmentCount > 0;

  const actions = hasHoldings
    ? [
        {
          title: "Add Investment",
          description: "Add a new asset to your portfolio",
          icon: "➕",
          href: "/portfolio",
          color: "bg-blue-100 text-blue-700",
        },
        {
          title: "Market Research",
          description: "Search stocks and view market insights",
          icon: "📈",
          href: "/market",
          color: "bg-green-100 text-green-700",
        },
        {
          title: "AI Analysis",
          description: "Run performance & risk simulations",
          icon: "🤖",
          href: "/analytics",
          color: "bg-purple-100 text-purple-700",
        },
      ]
    : [
        {
          title: "Create Your First Investment",
          description: "Start building your financial portfolio",
          icon: "🚀",
          href: "/portfolio",
          color: "bg-orange-100 text-orange-700",
        },
        {
          title: "Explore the Market",
          description: "Search trending stocks to get started",
          icon: "🔍",
          href: "/market",
          color: "bg-blue-100 text-blue-700",
        },
      ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${action.color}`}
            >
              {action.icon}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {action.title}
              </div>
              <div className="text-sm text-gray-500">
                {action.description}
              </div>
            </div>

            <ArrowRight
              size={20}
              className="text-gray-400 group-hover:text-blue-600 transition"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

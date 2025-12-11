import React from 'react';
import { portfolioAPI } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const HoldingsList = ({ holdings, onUpdate }) => {
  const [removingId, setRemovingId] = React.useState(null);

  const handleRemoveInvestment = async (investmentId) => {
    if (!window.confirm('Are you sure you want to remove this investment?')) {
      return;
    }

    setRemovingId(investmentId);
    try {
      await portfolioAPI.removeInvestment(investmentId);
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Error removing investment:', error);
      alert('Failed to remove investment: ' + (error.response?.data?.message || error.message));
    } finally {
      setRemovingId(null);
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (!holdings || holdings.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💼</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Investments Yet</h3>
        <p className="text-gray-500 text-sm">
          Add your first investment to start tracking your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {holdings.map((investment) => (
        <div key={investment._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Stock Symbol and Name */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{investment.symbol}</span>
                  <span className="text-sm text-gray-500">{investment.name}</span>
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {investment.type} • {investment.sector}
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {investment.quantity} shares
                </div>
                <div className="text-sm text-gray-500">
                  @ ${investment.purchasePrice?.toFixed(2)}
                </div>
              </div>

              {/* Current Value */}
              <div className="text-right min-w-24">
                <div className="font-semibold text-gray-900">
                  ${((investment.quantity || 0) * (investment.currentPrice || investment.purchasePrice || 0)).toFixed(2)}
                </div>
                <div className={`text-sm ${getChangeColor(investment.performance?.totalReturn || 0)}`}>
                  {investment.performance?.totalReturn >= 0 ? '+' : ''}
                  {investment.performance?.totalReturn?.toFixed(2) || '0.00'}%
                </div>
              </div>
            </div>

            {/* Remove Button */}
            <div className="ml-4">
              <button
                onClick={() => handleRemoveInvestment(investment._id)}
                disabled={removingId === investment._id}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                title="Remove investment"
              >
                {removingId === investment._id ? (
                  <LoadingSpinner size="small" />
                ) : (
                  '🗑️'
                )}
              </button>
            </div>
          </div>

          {/* Performance Details */}
          {investment.performance && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Price: </span>
                <span className="font-medium">
                  ${investment.currentPrice?.toFixed(2) || investment.purchasePrice?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Total Return: </span>
                <span className={getChangeColor(investment.performance.totalReturn)}>
                  ${investment.performance.absoluteReturn?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Daily: </span>
                <span className={getChangeColor(investment.performance.dailyChange)}>
                  {investment.performance.dailyChange >= 0 ? '+' : ''}
                  {investment.performance.dailyChange?.toFixed(2) || '0.00'}%
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
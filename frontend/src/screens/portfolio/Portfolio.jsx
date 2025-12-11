import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../common/Header';
import { WebSocketStatus } from '../common/WebSocketStatus';
import { PortfolioChart } from './PortfolioChart';
import { HoldingsList } from './HoldingsList';
import { AddInvestmentModal } from './AddInvestmentModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { portfolioAPI } from '../../services/api'

export const Portfolio = () => {
  const { user } = useAuth();
  const { portfolio, fetchPortfolio, loading, error } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddInvestment = async (investmentData) => {
    try {
      await portfolioAPI.addInvestment(investmentData);
      await fetchPortfolio(); // Refresh portfolio data
      setShowAddModal(false);
      return { success: true };
    } catch (error) {
      console.error('Error adding investment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add investment' 
      };
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="large" text="Loading your portfolio..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
            <p className="text-gray-600 mt-1">
              Manage your investments and track performance
            </p>
          </div>
          <WebSocketStatus />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Portfolio Content */}
        {portfolio ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <PortfolioChart portfolio={portfolio} />
              
              {/* Portfolio Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ${portfolio.totalValue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-500">Total Value</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {portfolio.investments?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Holdings</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className={`text-2xl font-bold ${
                    portfolio.performance?.totalReturn > 0 ? 'text-green-600' : 
                    portfolio.performance?.totalReturn < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {portfolio.performance?.totalReturn > 0 ? '+' : ''}
                    {portfolio.performance?.totalReturn?.toFixed(2) || '0.00'}%
                  </div>
                  <div className="text-sm text-gray-500">Total Return</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {portfolio.riskLevel ? portfolio.riskLevel.charAt(0).toUpperCase() + portfolio.riskLevel.slice(1) : 'Moderate'}
                  </div>
                  <div className="text-sm text-gray-500">Risk Level</div>
                </div>
              </div>

              {/* Holdings List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Your Investments</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    + Add Investment
                  </button>
                </div>
                <HoldingsList 
                  holdings={portfolio.investments} 
                  onUpdate={fetchPortfolio}
                />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Asset Allocation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                {portfolio.assetAllocation ? (
                  <div className="space-y-3">
                    {Object.entries(portfolio.assetAllocation).map(([asset, percentage]) => (
                      percentage > 0 && (
                        <div key={asset} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 capitalize">
                            {asset === 'etfs' ? 'ETFs' : 
                             asset === 'cryptocurrencies' ? 'Crypto' : 
                             asset}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {percentage}%
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No allocation data available</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Add New Investment
                  </button>
                  <button className="w-full bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    Run Portfolio Analysis
                  </button>
                  <button className="w-full bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    Export Portfolio Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Portfolio Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your investment portfolio by adding your first investment.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Investment
            </button>
          </div>
        )}

        {/* Add Investment Modal */}
        {showAddModal && (
          <AddInvestmentModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddInvestment}
          />
        )}
      </main>
    </div>
  );
};
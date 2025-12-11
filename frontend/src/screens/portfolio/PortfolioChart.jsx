import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const PortfolioChart = ({ portfolio = {} }) => {
  // Safely extract values
  const safePortfolio = portfolio || {};
  const totalValue = safePortfolio.totalValue || 0;
  const totalReturn = safePortfolio.performance?.totalReturn || 0;
  const investments = safePortfolio.investments || [];
  const initialInvestment = safePortfolio.initialInvestment || totalValue / 1.2; // Estimate if not provided
  const metrics = safePortfolio.metrics || {};
  const assetAllocation = safePortfolio.assetAllocation || {};
  const createdAt = safePortfolio.createdAt ? new Date(safePortfolio.createdAt) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago if not provided

  // Generate performance data over time
  const generatePerformanceData = () => {
    const months = 12;
    const data = [];
    const labels = [];
    
    // Create monthly data points
    for (let i = 0; i < months; i++) {
      const date = new Date(createdAt);
      date.setMonth(date.getMonth() + i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      
      // Calculate value for this month
      const progress = i / (months - 1); // 0 to 1
      const monthlyReturn = totalReturn * progress / 100;
      const value = initialInvestment * (1 + monthlyReturn);
      data.push(value);
    }
    
    // Ensure last point is current total value
    data[data.length - 1] = totalValue;
    
    return { labels, data };
  };

  const performanceData = generatePerformanceData();
  
  // Generate asset allocation data
  const generateAssetAllocationData = () => {
    if (metrics.assetAllocation && Object.keys(metrics.assetAllocation).length > 0) {
      const labels = [];
      const data = [];
      const backgroundColors = [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',   // Yellow
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(6, 182, 212, 0.8)',    // Cyan
      ];
      
      Object.entries(metrics.assetAllocation).forEach(([asset, info], index) => {
        labels.push(asset.charAt(0).toUpperCase() + asset.slice(1));
        data.push(info.percentage || 0);
      });
      
      return { labels, data, backgroundColors: backgroundColors.slice(0, labels.length) };
    } else if (assetAllocation && Object.keys(assetAllocation).length > 0) {
      // Use the main assetAllocation object as fallback
      const labels = [];
      const data = [];
      const backgroundColors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)',
      ];
      
      Object.entries(assetAllocation).forEach(([asset, value], index) => {
        if (typeof value === 'number' && value > 0 && asset !== '_id') {
          labels.push(asset.charAt(0).toUpperCase() + asset.slice(1));
          data.push(value);
        }
      });
      
      return { labels, data, backgroundColors: backgroundColors.slice(0, labels.length) };
    }
    
    return null;
  };

  const assetData = generateAssetAllocationData();

  // Line chart options for performance
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: '#6B7280',
          callback: (value) => {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: '#3B82F6',
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
    },
  };

  // Line chart data
  const lineChartData = {
    labels: performanceData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceData.data,
        borderColor: totalReturn >= 0 ? '#10B981' : '#EF4444',
        backgroundColor: totalReturn >= 0 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        pointBackgroundColor: totalReturn >= 0 ? '#10B981' : '#EF4444',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
    ],
  };

  // Bar chart options for asset allocation
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: '#6B7280',
          callback: (value) => {
            return value + '%';
          },
        },
      },
    },
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getReturnColor = (value) => {
    const num = Number(value);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Determine which chart to show based on available data
  const showPerformanceChart = totalValue > 0;
  const showAssetChart = assetData && assetData.data.length > 0;
  const [activeChart, setActiveChart] = React.useState('performance');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Performance</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveChart('performance')}
            className={`text-sm px-3 py-1 rounded border transition-colors ${
              activeChart === 'performance' 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            Performance
          </button>
          {showAssetChart && (
            <button 
              onClick={() => setActiveChart('allocation')}
              className={`text-sm px-3 py-1 rounded border transition-colors ${
                activeChart === 'allocation' 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Allocation
            </button>
          )}
          <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors">
            1Y
          </button>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="h-64 mb-6">
        {showPerformanceChart ? (
          <>
            {activeChart === 'performance' ? (
              <div className="h-full">
                <Line options={lineChartOptions} data={lineChartData} />
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                  <span>Start: {formatCurrency(initialInvestment)}</span>
                  <span className={getReturnColor(totalReturn)}>
                    Return: {formatPercentage(totalReturn)}
                  </span>
                  <span>Current: {formatCurrency(totalValue)}</span>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <Bar 
                  options={barChartOptions} 
                  data={{
                    labels: assetData.labels,
                    datasets: [
                      {
                        data: assetData.data,
                        backgroundColor: assetData.backgroundColors,
                        borderColor: assetData.backgroundColors.map(color => color.replace('0.8', '1')),
                        borderWidth: 1,
                        borderRadius: 4,
                      }
                    ]
                  }} 
                />
                <div className="text-center text-xs text-gray-500 mt-2">
                  Portfolio Asset Allocation
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200">
            <div className="text-5xl mb-3 text-gray-300">📊</div>
            <p className="text-gray-500 font-medium">No Portfolio Data</p>
            <p className="text-gray-400 text-sm mt-1">
              Add investments to see performance charts
            </p>
          </div>
        )}
      </div>
      
      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${getReturnColor(totalReturn)}`}>
            {formatPercentage(totalReturn)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Return</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalReturn >= 0 ? '↗ Profitable' : '↘ Down'} 
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Current Value</div>
          <div className="text-xs text-gray-400 mt-1">
            {investments.length} holding{investments.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {investments.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Holdings</div>
          <div className="text-xs text-gray-400 mt-1">
            {safePortfolio.riskLevel || 'Moderate'} risk
          </div>
        </div>
      </div>
      
      {/* Investment Breakdown */}
      {investments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Investment Breakdown</h4>
          <div className="space-y-2">
            {investments.map((inv, index) => {
              const currentValue = (inv.quantity || 0) * (inv.currentPrice || 0);
              const purchaseValue = (inv.quantity || 0) * (inv.purchasePrice || inv.currentPrice || 0);
              const gain = currentValue - purchaseValue;
              const gainPercentage = purchaseValue > 0 ? (gain / purchaseValue * 100) : 0;
              
              return (
                <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 font-semibold">
                      {inv.symbol?.substring(0, 2) || '??'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{inv.symbol || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{inv.name || 'Investment'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {inv.quantity || 0} shares
                    </div>
                    <div className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="text-sm text-blue-700 font-medium">Total Gain</div>
            <div className="text-xl font-bold text-blue-800">
              {formatCurrency(totalValue - initialInvestment)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              From {formatCurrency(initialInvestment)}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <div className="text-sm text-green-700 font-medium">Best Performer</div>
            <div className="text-xl font-bold text-green-800">AAPL</div>
            <div className="text-xs text-green-600 mt-1">
              +{Math.abs(totalReturn).toFixed(1)}% overall
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
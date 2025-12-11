import React from 'react';
import { PortfolioOverview } from './PortfolioOverview';
import { MarketOverview } from './MarketOverview';
import { QuickActions } from './QuickActions';
import { RealTimeQuotes } from '../market/RealTimeQuotes';

export const Dashboard = () => {
  const watchlistSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioOverview />
          <MarketOverview />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          <RealTimeQuotes symbols={watchlistSymbols} />
        </div>
      </div>
    </div>
  );
};
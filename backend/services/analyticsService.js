import fmpService from './fmpService.js';

class AnalyticsService {
  
  // Calculate portfolio Sharpe Ratio
  calculateSharpeRatio(portfolio, riskFreeRate = 0.02) {
    const returns = this.calculateHistoricalReturns(portfolio);
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const stdDev = this.calculateStandardDeviation(returns);
    
    if (stdDev === 0) return 0;
    
    return (avgReturn - riskFreeRate) / stdDev;
  }

  // Calculate Value at Risk (VaR) - 95% confidence
  calculateValueAtRisk(portfolio, confidenceLevel = 0.05) {
    const returns = this.calculateHistoricalReturns(portfolio);
    if (returns.length === 0) return 0;

    const sortedReturns = returns.sort((a, b) => a - b);
    const varIndex = Math.floor(confidenceLevel * sortedReturns.length);
    const varValue = sortedReturns[varIndex];
    
    return portfolio.totalValue * varValue;
  }

  // Calculate portfolio Beta vs S&P 500
  async calculatePortfolioBeta(portfolio) {
    try {
      const portfolioReturns = this.calculateHistoricalReturns(portfolio);
      if (portfolioReturns.length === 0) return 1;

      // Get S&P 500 returns
      const spyReturns = await this.getBenchmarkReturns('SPY');
      if (spyReturns.length === 0) return 1;

      // Align the return periods
      const minLength = Math.min(portfolioReturns.length, spyReturns.length);
      const alignedPortfolioReturns = portfolioReturns.slice(0, minLength);
      const alignedSpyReturns = spyReturns.slice(0, minLength);

      const covariance = this.calculateCovariance(alignedPortfolioReturns, alignedSpyReturns);
      const spyVariance = this.calculateVariance(alignedSpyReturns);

      if (spyVariance === 0) return 1;

      return covariance / spyVariance;
    } catch (error) {
      console.error('Error calculating portfolio beta:', error);
      return 1; // Default to market beta
    }
  }

  // Calculate portfolio diversification score (0-100)
  calculateDiversificationScore(portfolio) {
    if (!portfolio.investments || portfolio.investments.length === 0) return 0;

    const sectorWeights = {};
    let totalValue = 0;

    // Calculate sector weights
    portfolio.investments.forEach(investment => {
      const sector = investment.sector || 'Other';
      const value = investment.quantity * (investment.currentPrice || investment.purchasePrice);
      
      sectorWeights[sector] = (sectorWeights[sector] || 0) + value;
      totalValue += value;
    });

    // Calculate Herfindahl index (concentration measure)
    let herfindahlIndex = 0;
    Object.values(sectorWeights).forEach(weight => {
      const proportion = weight / totalValue;
      herfindahlIndex += proportion * proportion;
    });

    // Convert to diversification score (0-100)
    const maxSectors = Object.keys(sectorWeights).length;
    const diversificationScore = Math.max(0, 100 - (herfindahlIndex * 100));
    
    return {
      score: Math.round(diversificationScore),
      sectors: Object.keys(sectorWeights).length,
      sectorWeights,
      herfindahlIndex: parseFloat(herfindahlIndex.toFixed(4))
    };
  }

  // Monte Carlo simulation for portfolio projection
  runMonteCarloSimulation(portfolio, years = 10, simulations = 1000) {
    const initialValue = portfolio.totalValue;
    const results = [];
    const expectedReturn = 0.07; // 7% average market return
    const volatility = 0.15; // 15% annual volatility

    for (let i = 0; i < simulations; i++) {
      let value = initialValue;
      const path = [value];

      for (let year = 1; year <= years; year++) {
        // Random return based on expected return and volatility
        const randomReturn = expectedReturn + (Math.random() - 0.5) * volatility * 2;
        value = value * (1 + randomReturn);
        path.push(value);
      }

      results.push({
        finalValue: value,
        path: path,
        totalReturn: (value - initialValue) / initialValue
      });
    }

    // Calculate percentiles
    results.sort((a, b) => a.finalValue - b.finalValue);
    
    return {
      initialValue,
      years,
      simulations,
      percentiles: {
        p5: results[Math.floor(simulations * 0.05)].finalValue,
        p25: results[Math.floor(simulations * 0.25)].finalValue,
        p50: results[Math.floor(simulations * 0.5)].finalValue,
        p75: results[Math.floor(simulations * 0.75)].finalValue,
        p95: results[Math.floor(simulations * 0.95)].finalValue
      },
      expectedFinalValue: results[Math.floor(simulations * 0.5)].finalValue,
      bestCase: results[simulations - 1].finalValue,
      worstCase: results[0].finalValue,
      samplePaths: results.slice(0, 10).map(r => r.path) // Sample paths for charting
    };
  }

  // Calculate portfolio stress test under different scenarios
  stressTestPortfolio(portfolio) {
    const scenarios = {
      marketCrash: { return: -0.40, volatility: 0.25 }, // -40% return
      recession: { return: -0.20, volatility: 0.20 },   // -20% return
      stagnation: { return: 0.00, volatility: 0.10 },   // 0% return
      moderateGrowth: { return: 0.10, volatility: 0.15 }, // +10% return
      highGrowth: { return: 0.25, volatility: 0.20 }    // +25% return
    };

    const results = {};
    const currentValue = portfolio.totalValue;

    Object.entries(scenarios).forEach(([scenario, params]) => {
      const finalValue = currentValue * (1 + params.return);
      const loss = currentValue - finalValue;
      
      results[scenario] = {
        scenario: this.formatScenarioName(scenario),
        currentValue,
        finalValue: parseFloat(finalValue.toFixed(2)),
        return: parseFloat((params.return * 100).toFixed(1)),
        loss: parseFloat(loss.toFixed(2)),
        riskLevel: this.assessRiskLevel(params.return, params.volatility)
      };
    });

    return results;
  }

  // Calculate efficient frontier (Modern Portfolio Theory)
  calculateEfficientFrontier(assets, riskFreeRate = 0.02) {
    // This is a simplified version - in production, you'd use more sophisticated algorithms
    const portfolios = [];
    
    for (let i = 0; i <= 100; i += 5) {
      const stockWeight = i / 100;
      const bondWeight = 1 - stockWeight;
      
      const expectedReturn = stockWeight * 0.08 + bondWeight * 0.03; // 8% stocks, 3% bonds
      const volatility = Math.sqrt(
        Math.pow(stockWeight, 2) * Math.pow(0.15, 2) + 
        Math.pow(bondWeight, 2) * Math.pow(0.05, 2) +
        2 * stockWeight * bondWeight * 0.1 * 0.15 * 0.05
      );
      
      const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
      
      portfolios.push({
        stockWeight,
        bondWeight,
        expectedReturn: parseFloat((expectedReturn * 100).toFixed(2)),
        volatility: parseFloat((volatility * 100).toFixed(2)),
        sharpeRatio: parseFloat(sharpeRatio.toFixed(3))
      });
    }

    return portfolios;
  }

  // Helper methods
  calculateHistoricalReturns(portfolio) {
    // Simplified - in production, you'd use actual historical data
    // For now, we'll generate synthetic returns based on portfolio composition
    const returns = [];
    const baseVolatility = 0.15;
    
    for (let i = 0; i < 252; i++) { // 1 year of daily returns
      const randomReturn = (Math.random() - 0.5) * baseVolatility * 2;
      returns.push(randomReturn);
    }
    
    return returns;
  }

  async getBenchmarkReturns(symbol) {
    try {
      const historicalData = await fmpService.getHistoricalData(symbol, 'daily');
      const returns = [];
      
      for (let i = 1; i < historicalData.length; i++) {
        const returnToday = (historicalData[i].close - historicalData[i-1].close) / historicalData[i-1].close;
        returns.push(returnToday);
      }
      
      return returns;
    } catch (error) {
      console.error('Error getting benchmark returns:', error);
      return this.calculateHistoricalReturns({}); // Fallback to synthetic returns
    }
  }

  calculateStandardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  calculateCovariance(x, y) {
    const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    let covariance = 0;
    for (let i = 0; i < x.length; i++) {
      covariance += (x[i] - xMean) * (y[i] - yMean);
    }
    
    return covariance / x.length;
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  formatScenarioName(scenario) {
    const names = {
      marketCrash: 'Market Crash (-40%)',
      recession: 'Recession (-20%)',
      stagnation: 'Economic Stagnation (0%)',
      moderateGrowth: 'Moderate Growth (+10%)',
      highGrowth: 'High Growth (+25%)'
    };
    return names[scenario] || scenario;
  }

  assessRiskLevel(returnRate, volatility) {
    if (returnRate < -0.1) return 'Very High Risk';
    if (returnRate < 0) return 'High Risk';
    if (returnRate < 0.05) return 'Medium Risk';
    if (returnRate < 0.15) return 'Low Risk';
    return 'Very Low Risk';
  }
}

export default new AnalyticsService();
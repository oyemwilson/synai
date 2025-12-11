import AnalyticsService from '../services/analyticsService.js';
import Portfolio from '../models/portfolio.js';

// Helper methods - define them as regular functions at the module level
const calculateOverallRiskScore = (sharpeRatio, beta, diversificationScore) => {
  // Normalize scores (simplified calculation)
  const sharpeScore = Math.max(0, Math.min(100, (sharpeRatio + 1) * 50));
  const betaScore = Math.max(0, Math.min(100, (2 - beta) * 50));
  const diversificationScoreNorm = diversificationScore;
  
  const overallScore = (sharpeScore * 0.4 + betaScore * 0.3 + diversificationScoreNorm * 0.3);
  
  return {
    score: Math.round(overallScore),
    level: overallScore >= 80 ? 'Low' : overallScore >= 60 ? 'Medium' : overallScore >= 40 ? 'High' : 'Very High',
    components: {
      sharpeScore: Math.round(sharpeScore),
      betaScore: Math.round(betaScore),
      diversificationScore: Math.round(diversificationScoreNorm)
    }
  };
};

const getExpectedReturn = (assetType) => {
  const returns = {
    stock: 0.08,
    bond: 0.03,
    etf: 0.07,
    crypto: 0.12,
    'real-estate': 0.06,
    other: 0.05
  };
  return returns[assetType] || 0.06;
};

const getVolatility = (assetType) => {
  const volatilities = {
    stock: 0.15,
    bond: 0.05,
    etf: 0.12,
    crypto: 0.30,
    'real-estate': 0.08,
    other: 0.10
  };
  return volatilities[assetType] || 0.10;
};

const calculateStockWeight = (portfolio) => {
  const totalValue = portfolio.totalValue;
  if (totalValue === 0) return 0;
  
  const stockValue = portfolio.investments
    .filter(inv => inv.type === 'stock')
    .reduce((sum, inv) => sum + (inv.quantity * (inv.currentPrice || inv.purchasePrice)), 0);
  
  return parseFloat(((stockValue / totalValue) * 100).toFixed(1));
};

const findOptimalAllocation = (efficientFrontier) => {
  // Find allocation with highest Sharpe ratio
  return efficientFrontier.reduce((best, current) => 
    current.sharpeRatio > (best.sharpeRatio || 0) ? current : best
  );
};

// Get comprehensive portfolio analytics
const getPortfolioAnalytics = async (request, reply) => {
  try {
    const portfolio = await Portfolio.findOne({ user: request.userId });
    if (!portfolio) {
      return reply.code(404).send({ message: 'Portfolio not found' });
    }

    // Calculate all analytics
    const sharpeRatio = AnalyticsService.calculateSharpeRatio(portfolio);
    const valueAtRisk = AnalyticsService.calculateValueAtRisk(portfolio);
    const beta = await AnalyticsService.calculatePortfolioBeta(portfolio);
    const diversification = AnalyticsService.calculateDiversificationScore(portfolio);
    const stressTest = AnalyticsService.stressTestPortfolio(portfolio);

    const analytics = {
      riskMetrics: {
        sharpeRatio: parseFloat(sharpeRatio.toFixed(3)),
        valueAtRisk: parseFloat(valueAtRisk.toFixed(2)),
        beta: parseFloat(beta.toFixed(3)),
        volatility: '15%', // This would be calculated from historical data
        maxDrawdown: '12%' // This would be calculated from historical data
      },
      diversification,
      stressTest,
      overallRiskScore: calculateOverallRiskScore(sharpeRatio, beta, diversification.score),
      lastUpdated: new Date()
    };

    reply.send(analytics);
  } catch (error) {
    console.error('Portfolio Analytics Error:', error);
    reply.code(500).send({ 
      message: 'Failed to calculate portfolio analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Run Monte Carlo simulation
const runMonteCarloSimulation = async (request, reply) => {
  try {
    const { years = 10, simulations = 1000 } = request.body;
    
    const portfolio = await Portfolio.findOne({ user: request.userId });
    if (!portfolio) {
      return reply.code(404).send({ message: 'Portfolio not found' });
    }

    const simulation = AnalyticsService.runMonteCarloSimulation(portfolio, years, simulations);

    reply.send(simulation);
  } catch (error) {
    console.error('Monte Carlo Simulation Error:', error);
    reply.code(500).send({ 
      message: 'Failed to run Monte Carlo simulation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get efficient frontier analysis
const getEfficientFrontier = async (request, reply) => {
  try {
    const portfolio = await Portfolio.findOne({ user: request.userId });
    if (!portfolio) {
      return reply.code(404).send({ message: 'Portfolio not found' });
    }

    // Extract assets from portfolio for frontier calculation
    const assets = portfolio.investments.map(inv => ({
      symbol: inv.symbol,
      type: inv.type,
      expectedReturn: getExpectedReturn(inv.type),
      volatility: getVolatility(inv.type)
    }));

    const efficientFrontier = AnalyticsService.calculateEfficientFrontier(assets);

    reply.send({
      currentPortfolio: {
        stockWeight: calculateStockWeight(portfolio),
        expectedReturn: '7.5%', // This would be calculated
        volatility: '15.2%' // This would be calculated
      },
      efficientFrontier,
      recommendedAllocation: findOptimalAllocation(efficientFrontier)
    });
  } catch (error) {
    console.error('Efficient Frontier Error:', error);
    reply.code(500).send({ 
      message: 'Failed to calculate efficient frontier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  getPortfolioAnalytics,
  runMonteCarloSimulation,
  getEfficientFrontier
};
import Portfolio from '../models/portfolio.js';
import User from '../models/user.js';
import fmpService from '../services/fmpService.js';

// Enhanced getPortfolioOverview
const getPortfolioOverview = async (request, reply) => {
  try {
    let portfolio = await Portfolio.findOne({ user: request.userId })
      .populate('user', 'username email riskProfile');

    if (!portfolio) {
      const user = await User.findById(request.userId);
      portfolio = await createInitialPortfolio(user);
    }

    // Update with real market data
    const updatedPortfolio = await updatePortfolioValues(portfolio);
    const metrics = getPortfolioMetrics(updatedPortfolio);

    reply.send({
      ...updatedPortfolio.toObject(),
      metrics,
      lastUpdated: updatedPortfolio.lastUpdated
    });
    
  } catch (error) {
    console.error('Get Portfolio Error:', error);
    reply.code(500).send({ 
      message: 'Failed to fetch portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create initial portfolio based on user's risk profile
const createInitialPortfolio = async (user) => {
  const riskBasedAllocation = getRiskBasedAllocation(user.riskProfile);
  
  const portfolio = new Portfolio({
    user: user._id,
    riskLevel: user.riskProfile,
    assetAllocation: riskBasedAllocation,
    investments: generateInitialInvestments(riskBasedAllocation)
  });

  return await portfolio.save();
};

// Get risk-based asset allocation
const getRiskBasedAllocation = (riskProfile) => {
  const allocations = {
    conservative: { stocks: 30, bonds: 50, etfs: 10, cash: 10 },
    moderate: { stocks: 50, bonds: 30, etfs: 15, cryptocurrencies: 5 },
    aggressive: { stocks: 70, bonds: 10, etfs: 10, cryptocurrencies: 10 }
  };
  
  return allocations[riskProfile] || allocations.moderate;
};

// Generate sample initial investments
const generateInitialInvestments = (allocation) => {
  const investments = [];
  
  if (allocation.stocks > 0) {
    investments.push({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 150,
      purchaseDate: new Date(),
      sector: 'Technology'
    });
  }
  
  if (allocation.bonds > 0) {
    investments.push({
      symbol: 'GOVT',
      name: 'US Treasury Bond ETF',
      type: 'bond',
      quantity: 5,
      purchasePrice: 100,
      currentPrice: 100,
      purchaseDate: new Date(),
      sector: 'Government Bonds'
    });
  }
  
  // Add more based on allocation...
  return investments;
};


// Add investment to portfolio
const addInvestment = async (request, reply) => {
  try {
    const { symbol, name, type, quantity, purchasePrice, sector } = request.body;
    
    const portfolio = await Portfolio.findOne({ user: request.userId });
    if (!portfolio) {
      return reply.code(404).send({ message: 'Portfolio not found' });
    }

    const newInvestment = {
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      currentPrice: purchasePrice,
      purchaseDate: new Date(),
      sector,
      performance: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
      }
    };

    portfolio.investments.push(newInvestment);
    portfolio.initialInvestment += quantity * purchasePrice;
    await portfolio.save();

    reply.send({ 
      message: 'Investment added successfully',
      investment: newInvestment
    });
  } catch (error) {
    console.error('Add Investment Error:', error);
    reply.code(500).send({ 
      message: 'Failed to add investment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Enhanced updatePortfolioValues function with better error handling
const updatePortfolioValues = async (portfolio) => {
  let totalValue = 0;
  let updatedInvestments = 0;
  
  try {
    // Filter out investments with valid symbols
    const validInvestments = portfolio.investments.filter(inv => 
      inv.symbol && inv.symbol.trim() !== ''
    );
    
    if (validInvestments.length === 0) {
      console.log('No valid investments to update');
      return portfolio;
    }

    const symbols = validInvestments.map(inv => inv.symbol);
    console.log(`Fetching quotes for symbols: ${symbols.join(', ')}`);
    
    // Get real-time quotes for all investments
    const quotes = await fmpService.getMultipleQuotes(symbols);
    
    portfolio.investments.forEach(investment => {
      const quote = quotes[investment.symbol];
      
      if (quote && quote.price && !isNaN(quote.price)) {
        investment.currentPrice = parseFloat(quote.price);
        const currentValue = investment.quantity * investment.currentPrice;
        totalValue += currentValue;
        updatedInvestments++;
        
        // Calculate performance metrics
        const purchaseValue = investment.quantity * investment.purchasePrice;
        const totalReturn = ((currentValue - purchaseValue) / purchaseValue) * 100;
        const absoluteReturn = currentValue - purchaseValue;
        
        investment.performance = {
          totalReturn: parseFloat(totalReturn.toFixed(2)),
          absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
          dailyChange: quote.changesPercentage || 0,
          currentValue: parseFloat(currentValue.toFixed(2)),
          purchaseValue: parseFloat(purchaseValue.toFixed(2))
        };

        // Add additional metrics if available from FMP
        if (quote.change) {
          investment.dailyChange = parseFloat(quote.change.toFixed(2));
        }
        if (quote.changesPercentage) {
          investment.dailyChangePercent = parseFloat(quote.changesPercentage.toFixed(2));
        }
        
      } else {
        // If no quote available, use purchase price as current price
        console.warn(`No valid quote for ${investment.symbol}, using purchase price`);
        const currentValue = investment.quantity * investment.purchasePrice;
        totalValue += currentValue;
        
        investment.currentPrice = investment.purchasePrice;
        investment.performance = {
          totalReturn: 0,
          absoluteReturn: 0,
          dailyChange: 0,
          currentValue: parseFloat(currentValue.toFixed(2)),
          purchaseValue: parseFloat(currentValue.toFixed(2))
        };
      }
    });
    
    // Update portfolio totals
    portfolio.totalValue = parseFloat(totalValue.toFixed(2));
    portfolio.lastUpdated = new Date();
    
    // Calculate portfolio performance
    const initialInvestment = portfolio.investments.reduce((sum, inv) => 
      sum + (inv.quantity * inv.purchasePrice), 0
    );
    
    portfolio.performance = {
      totalReturn: initialInvestment > 0 ? 
        parseFloat(((totalValue - initialInvestment) / initialInvestment * 100).toFixed(2)) : 0,
      absoluteReturn: parseFloat((totalValue - initialInvestment).toFixed(2)),
      lastUpdated: new Date()
    };

    console.log(`Updated ${updatedInvestments}/${portfolio.investments.length} investments. Total value: $${portfolio.totalValue}`);
    
    await portfolio.save();
    return portfolio;
    
  } catch (error) {
    console.error('Error updating portfolio values:', error);
    // Fallback to mock calculations with better error info
    return await updatePortfolioValuesMock(portfolio, error.message);
  }
};

// Enhanced fallback function
const updatePortfolioValuesMock = async (portfolio, errorReason = 'Unknown error') => {
  console.log(`Using mock data for portfolio update. Reason: ${errorReason}`);
  
  let totalValue = 0;
  
  portfolio.investments.forEach(investment => {
    // Simulate realistic price fluctuations (±5%)
    const fluctuation = (Math.random() * 10 - 5) / 100;
    investment.currentPrice = parseFloat((investment.purchasePrice * (1 + fluctuation)).toFixed(2));
    
    const currentValue = investment.quantity * investment.currentPrice;
    totalValue += currentValue;
    
    const purchaseValue = investment.quantity * investment.purchasePrice;
    const totalReturn = ((currentValue - purchaseValue) / purchaseValue) * 100;
    
    investment.performance = {
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      absoluteReturn: parseFloat((currentValue - purchaseValue).toFixed(2)),
      dailyChange: parseFloat((fluctuation * 100).toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      purchaseValue: parseFloat(purchaseValue.toFixed(2)),
      isMock: true // Flag to indicate mock data
    };
  });
  
  portfolio.totalValue = parseFloat(totalValue.toFixed(2));
  portfolio.lastUpdated = new Date();
  
  const initialInvestment = portfolio.investments.reduce((sum, inv) => 
    sum + (inv.quantity * inv.purchasePrice), 0
  );
  
  portfolio.performance = {
    totalReturn: parseFloat(((totalValue - initialInvestment) / initialInvestment * 100).toFixed(2)),
    absoluteReturn: parseFloat((totalValue - initialInvestment).toFixed(2)),
    lastUpdated: new Date(),
    isMock: true
  };

  await portfolio.save();
  return portfolio;
};

// Remove investment from portfolio
const removeInvestment = async (request, reply) => {
  try {
    const { investmentId } = request.params;
    
    const portfolio = await Portfolio.findOne({ user: request.userId });
    if (!portfolio) {
      return reply.code(404).send({ message: 'Portfolio not found' });
    }

    portfolio.investments = portfolio.investments.filter(
      inv => inv._id.toString() !== investmentId
    );
    
    await portfolio.save();

    reply.send({ message: 'Investment removed successfully' });
  } catch (error) {
    console.error('Remove Investment Error:', error);
    reply.code(500).send({ 
      message: 'Failed to remove investment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Run portfolio simulation (What-If Analysis)
const runSimulation = async (request, reply) => {
  try {
    const { timeframe, marketCondition, additionalInvestment } = request.body;
    
    const portfolio = await Portfolio.findOne({ user: request.userId });
    if (!portfolio) {
      return reply.code(404).send({ message: 'Portfolio not found' });
    }

    // Simulate different market scenarios
    const scenarios = {
      bullish: { return: 0.15, volatility: 0.1 }, // +15% return
      bearish: { return: -0.10, volatility: 0.2 }, // -10% return
      stable: { return: 0.05, volatility: 0.05 }  // +5% return
    };

    const scenario = scenarios[marketCondition] || scenarios.stable;
    
    // Calculate projected value
    const currentValue = portfolio.totalValue;
    const projectedValue = currentValue * (1 + scenario.return);
    const valueWithInvestment = (currentValue + additionalInvestment) * (1 + scenario.return);

    const simulationResult = {
      timeframe,
      marketCondition,
      currentValue,
      projectedValue,
      valueWithInvestment: additionalInvestment ? valueWithInvestment : null,
      expectedReturn: scenario.return * 100,
      riskLevel: scenario.volatility * 100,
      timestamp: new Date()
    };

    reply.send(simulationResult);
  } catch (error) {
    console.error('Simulation Error:', error);
    reply.code(500).send({ 
      message: 'Failed to run simulation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get portfolio performance history
const getPerformanceHistory = async (request, reply) => {
  try {
    const { period } = request.query; // daily, weekly, monthly, yearly
    
    // Mock performance data - in real app, this would come from your database
    const generatePerformanceData = (period) => {
      const data = [];
      const points = period === 'daily' ? 24 : period === 'weekly' ? 7 : 30;
      
      let value = 10000; // Starting value
      
      for (let i = 0; i < points; i++) {
        const fluctuation = (Math.random() * 4 - 2) / 100; // -2% to +2%
        value = value * (1 + fluctuation);
        
        data.push({
          date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000),
          value: Math.round(value),
          return: fluctuation * 100
        });
      }
      
      return data;
    };

    const performanceData = generatePerformanceData(period || 'monthly');

    reply.send({
      period: period || 'monthly',
      data: performanceData,
      summary: {
        totalReturn: performanceData[performanceData.length - 1].value - 10000,
        bestDay: Math.max(...performanceData.map(d => d.return)),
        worstDay: Math.min(...performanceData.map(d => d.return))
      }
    });
  } catch (error) {
    console.error('Performance History Error:', error);
    reply.code(500).send({ 
      message: 'Failed to fetch performance history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Helper function to update single investment
const updateSingleInvestment = async (portfolio, investment) => {
  try {
    const quote = await fmpService.getStockQuote(investment.symbol);
    
    if (quote && quote.price) {
      investment.currentPrice = parseFloat(quote.price);
      const currentValue = investment.quantity * investment.currentPrice;
      
      const purchaseValue = investment.quantity * investment.purchasePrice;
      const totalReturn = ((currentValue - purchaseValue) / purchaseValue) * 100;
      
      investment.performance = {
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        absoluteReturn: parseFloat((currentValue - purchaseValue).toFixed(2)),
        dailyChange: quote.changesPercentage || 0,
        currentValue: parseFloat(currentValue.toFixed(2)),
        purchaseValue: parseFloat(purchaseValue.toFixed(2)),
        lastUpdated: new Date()
      };
      
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating single investment ${investment.symbol}:`, error);
    return false;
  }
};

// Function to get portfolio metrics
const getPortfolioMetrics = (portfolio) => {
  const metrics = {
    totalValue: portfolio.totalValue,
    totalReturn: portfolio.performance?.totalReturn || 0,
    absoluteReturn: portfolio.performance?.absoluteReturn || 0,
    investmentCount: portfolio.investments.length,
    lastUpdated: portfolio.lastUpdated,
    assetAllocation: {}
  };

  // Calculate asset allocation
  portfolio.investments.forEach(investment => {
    const currentValue = investment.quantity * (investment.currentPrice || investment.purchasePrice);
    const assetType = investment.type || 'other';
    
    if (!metrics.assetAllocation[assetType]) {
      metrics.assetAllocation[assetType] = {
        value: 0,
        percentage: 0
      };
    }
    
    metrics.assetAllocation[assetType].value += currentValue;
  });

  // Calculate percentages
  Object.keys(metrics.assetAllocation).forEach(type => {
    metrics.assetAllocation[type].percentage = 
      parseFloat(((metrics.assetAllocation[type].value / metrics.totalValue) * 100).toFixed(2));
  });

  return metrics;
};


export {
  getPortfolioOverview,
  addInvestment,
  removeInvestment,
  runSimulation,
  getPerformanceHistory,
  updatePortfolioValues
};
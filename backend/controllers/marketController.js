// controllers/marketController.js
import fmpService from '../services/fmpService.js';

// Get real-time quotes for multiple symbols
const getQuotes = async (request, reply) => {
  try {
    const { symbols } = request.query;
    
    if (!symbols) {
      return reply.code(400).send({ message: 'Symbols parameter is required' });
    }

    const symbolArray = symbols.split(',');
    const quotes = await fmpService.getMultipleQuotes(symbolArray);

    reply.send({
      timestamp: new Date(),
      dataSource: 'FMP',
      quotes
    });
  } catch (error) {
    console.error('Get Quotes Error:', error);
    reply.code(500).send({ 
      message: 'Failed to fetch market quotes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get historical data for a symbol
const getHistoricalData = async (request, reply) => {
  try {
    const { symbol } = request.params;
    const { period = 'daily' } = request.query;

    if (!symbol) {
      return reply.code(400).send({ message: 'Symbol parameter is required' });
    }

    const historicalData = await fmpService.getHistoricalData(symbol, period);

    reply.send({
      symbol,
      period,
      dataSource: 'FMP',
      data: historicalData
    });
  } catch (error) {
    console.error('Historical Data Error:', error);
    reply.code(500).send({ 
      message: 'Failed to fetch historical data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search for stocks using FMP
const searchStocks = async (request, reply) => {
  try {
    const { query } = request.query;

    if (!query || query.length < 2) {
      return reply.code(400).send({ message: 'Query parameter must be at least 2 characters' });
    }

    const results = await fmpService.searchStocks(query);

    reply.send({
      query,
      dataSource: 'FMP',
      results
    });
  } catch (error) {
    console.error('Stock Search Error:', error);
    reply.code(500).send({ 
      message: 'Failed to search stocks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get market overview with major indices
const getMarketOverview = async (request, reply) => {
  try {
    const marketIndices = await fmpService.getMarketIndices();

    // Calculate market sentiment based on major indices
    const indices = Object.values(marketIndices);
    const positiveIndices = indices.filter(index => 
      index.changesPercentage > 0 || (index.change > 0)
    ).length;
    
    const marketSentiment = indices.length > 0 ? positiveIndices / indices.length : 0.5;

    reply.send({
      timestamp: new Date(),
      dataSource: 'FMP',
      indices: marketIndices,
      marketSentiment: {
        value: marketSentiment,
        description: marketSentiment > 0.6 ? 'Bullish' : marketSentiment < 0.4 ? 'Bearish' : 'Neutral'
      },
      summary: {
        totalIndices: indices.length,
        advancing: positiveIndices,
        declining: indices.length - positiveIndices
      }
    });
  } catch (error) {
    console.error('Market Overview Error:', error);
    reply.code(500).send({ 
      message: 'Failed to fetch market overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get company profile
const getCompanyProfile = async (request, reply) => {
  try {
    const { symbol } = request.params;

    if (!symbol) {
      return reply.code(400).send({ message: 'Symbol parameter is required' });
    }

    // Get quote for basic info
    const quote = await fmpService.getStockQuote(symbol);
    
    const profile = {
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      marketCap: quote.marketCap,
      exchange: quote.exchange,
      industry: 'Technology', // Default - you would get this from FMP profile endpoint
      description: `${quote.name} is a company trading on ${quote.exchange}`,
      website: 'https://example.com', // Placeholder
      image: `https://financialmodelingprep.com/image-stock/${symbol}.png`
    };

    reply.send({
      symbol,
      dataSource: 'FMP',
      profile
    });
  } catch (error) {
    console.error('Company Profile Error:', error);
    reply.code(500).send({ 
      message: 'Failed to fetch company profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Test FMP connection endpoint - FIXED
const testFMPConnection = async (request, reply) => {
  try {
    const { symbol = 'AAPL', query = 'apple' } = request.query;
    
    console.log('🧪 Testing FMP connection...');

    // Test search (we know this works)
    const searchResults = await fmpService.searchStocks(query);
    
    // Test quote
    const quote = await fmpService.getStockQuote(symbol);
    
    reply.send({
      connection: 'success',
      tests: {
        search: {
          query: query,
          results: searchResults.length,
          working: searchResults.length > 0
        },
        quote: {
          symbol: symbol,
          price: quote.price,
          dataSource: quote.dataSource,
          working: !quote.isMock
        }
      },
      apiStats: fmpService.getStats ? await fmpService.getStats() : { message: 'Stats not available' }
    });
    
  } catch (error) {
    console.error('FMP Connection Test Error:', error);
    reply.code(500).send({ 
      message: 'FMP connection test failed',
      error: error.message 
    });
  }
};

export {
  getQuotes,
  getHistoricalData,
  searchStocks,
  getMarketOverview,
  getCompanyProfile,
  testFMPConnection
};
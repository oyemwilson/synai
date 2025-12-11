import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

class FMPDataService {
  constructor() {
    this.apiKey = process.env.FMP_API_KEY;
    this.baseURL = 'https://financialmodelingprep.com/stable'; // CHANGED to stable
    this.apiCallCount = 0;
    
    console.log(`✅ FMP Service initialized with API key: ${this.apiKey ? 'Present' : 'MISSING'}`);
  }

  // Search symbols using the working endpoint
  async searchStocks(query) {
    const cacheKey = `search_${query}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`📦 Using cached search results for: ${query}`);
      return cached;
    }

    console.log(`🔍 Searching FMP for: ${query}`);
    this.apiCallCount++;

    try {
      const response = await axios.get(`${this.baseURL}/search-symbol`, {
        params: {
          query: query,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      console.log(`✅ FMP Search Response for "${query}":`, {
        status: response.status,
        results: response.data?.length || 0
      });

      if (response.data && Array.isArray(response.data)) {
        const results = response.data.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          currency: stock.currency,
          stockExchange: stock.stockExchange,
          exchangeShortName: stock.exchangeShortName
        }));

        cache.set(cacheKey, results);
        return results;
      } else {
        console.warn(`Unexpected FMP search response structure for "${query}"`);
        return this.getMockSearchResults(query);
      }
    } catch (error) {
      console.error(`❌ FMP Search Error for "${query}":`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return this.getMockSearchResults(query);
    }
  }

  // Get stock quote - trying multiple endpoints
// Get stock quote - using stable endpoint with query param
async getStockQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`📦 Using cached quote for: ${symbol}`);
    return cached;
  }

  console.log(`🚀 Fetching FMP quote for: ${symbol}`);
  this.apiCallCount++;

  try {
    // ✅ CORRECT URL: /stable/quote?symbol=XYZ
    const response = await axios.get(`${this.baseURL}/quote`, {
      params: {
        symbol,          // <-- NOT in the path, in params
        apikey: this.apiKey,
      },
      timeout: 10000,
    });

    console.log(`✅ FMP Quote Response for ${symbol}:`, {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'n/a',
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const data = response.data[0];

      const quote = {
        symbol: data.symbol || symbol,
        name: data.name || symbol,
        price: data.price ?? data.currentPrice,
        changesPercentage: data.changesPercentage ?? data.changePercent,
        change: data.change ?? data.priceChange,
        dayLow: data.dayLow ?? data.low,
        dayHigh: data.dayHigh ?? data.high,
        open: data.open ?? data.openPrice,
        previousClose: data.previousClose,
        volume: data.volume,
        marketCap: data.marketCap,
        timestamp: new Date(),
        dataSource: 'FMP',
        isMock: false,
      };

      cache.set(cacheKey, quote);
      return quote;
    } else {
      throw new Error('No quote data received');
    }
  } catch (error) {
    console.error(`❌ FMP Quote Error for ${symbol}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // 🔁 Fallback to mock so UI still works
    const mock = this.getMockQuote(symbol);
    return mock;
  }
}

  // Get historical data
  async getHistoricalData(symbol, period = 'daily') {
    const cacheKey = `historical_${symbol}_${period}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    console.log(`📈 Fetching FMP historical data for: ${symbol} (${period})`);
    this.apiCallCount++;

    try {
      // Calculate date range
      const toDate = new Date().toISOString().split('T')[0];
      let fromDate = new Date();
      
      switch (period) {
        case 'daily':
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
        case 'weekly':
          fromDate.setFullYear(fromDate.getFullYear() - 2);
          break;
        case 'monthly':
          fromDate.setFullYear(fromDate.getFullYear() - 5);
          break;
      }
      
      const fromDateStr = fromDate.toISOString().split('T')[0];

      const response = await axios.get(`${this.baseURL}/historical-price-full/${symbol}`, {
        params: {
          from: fromDateStr,
          to: toDate,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.historical) {
        const historicalData = response.data.historical.map(day => ({
          date: day.date,
          open: day.open,
          high: day.high,
          low: day.low,
          close: day.close,
          volume: day.volume,
          change: day.change,
          changePercent: day.changePercent
        }));

        cache.set(cacheKey, historicalData);
        return historicalData;
      } else {
        throw new Error('No historical data in response');
      }
    } catch (error) {
      console.error(`❌ FMP Historical Data Error for ${symbol}:`, error.message);
      return this.getMockHistoricalData(symbol, period);
    }
  }

  // Get multiple quotes
  async getMultipleQuotes(symbols) {
    const quotes = {};
    
    for (const symbol of symbols) {
      quotes[symbol] = await this.getStockQuote(symbol);
    }
    
    return quotes;
  }

  // Get market indices
  async getMarketIndices() {
    const majorIndices = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
    return await this.getMultipleQuotes(majorIndices);
  }

  // Mock data fallbacks
  getMockQuote(symbol) {
    const basePrices = {
      'AAPL': 185, 'MSFT': 410, 'GOOGL': 175, 'AMZN': 180, 
      'TSLA': 245, 'META': 485, 'NVDA': 1180, 'JPM': 195,
      'JNJ': 155, 'V': 280, 'SPY': 520, 'QQQ': 440,
      '^GSPC': 5200, '^DJI': 39000, '^IXIC': 16500, '^RUT': 2100, '^VIX': 15
    };
    
    const basePrice = basePrices[symbol] || (100 + Math.random() * 200);
    const fluctuation = (Math.random() - 0.5) * 4;
    const price = basePrice * (1 + fluctuation / 100);
    const change = price - basePrice;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol,
      name: `${symbol} Company`,
      price: parseFloat(price.toFixed(2)),
      changesPercentage: parseFloat(changePercent.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      dayLow: parseFloat((price * 0.98).toFixed(2)),
      dayHigh: parseFloat((price * 1.02).toFixed(2)),
      open: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
      previousClose: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      timestamp: new Date(),
      dataSource: 'mock',
      isMock: true
    };
  }

  getMockHistoricalData(symbol, period) {
    const data = [];
    let price = 100 + (Math.random() * 200);
    const baseDate = new Date();
    const dataPoints = period === 'daily' ? 252 : period === 'weekly' ? 104 : 60;

    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.5) * 5;
      price = Math.max(1, price + change);
      
      data.push({
        date: new Date(baseDate.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        open: parseFloat((price - Math.random() * 2).toFixed(2)),
        high: parseFloat((price + Math.random() * 3).toFixed(2)),
        low: parseFloat((price - Math.random() * 3).toFixed(2)),
        close: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / price * 100).toFixed(2))
      });
    }

    return data.reverse();
  }

  getMockSearchResults(query) {
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', stockExchange: 'NASDAQ', exchangeShortName: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', currency: 'USD', stockExchange: 'NASDAQ', exchangeShortName: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', currency: 'USD', stockExchange: 'NASDAQ', exchangeShortName: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', currency: 'USD', stockExchange: 'NASDAQ', exchangeShortName: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', currency: 'USD', stockExchange: 'NASDAQ', exchangeShortName: 'NASDAQ' }
    ];

    return mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get API usage stats
  getStats() {
    return {
      apiCallCount: this.apiCallCount,
      cacheSize: cache.keys().length,
      currentSource: 'FMP Stable API'
    };
  }
}

export default new FMPDataService();
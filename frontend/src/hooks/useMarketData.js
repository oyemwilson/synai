import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState({
    quotes: {},
    historical: {},
    overview: null,
    loading: false,
    error: null
  });

  const fetchQuotes = async (symbols) => {
    setMarketData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const symbolString = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const response = await marketAPI.getQuotes(symbolString);
      setMarketData(prev => ({
        ...prev,
        quotes: { ...prev.quotes, ...response.data.quotes }
      }));
    } catch (error) {
      setMarketData(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to fetch quotes'
      }));
    } finally {
      setMarketData(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchHistoricalData = async (symbol, period = 'daily') => {
    setMarketData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await marketAPI.getHistoricalData(symbol, period);
      setMarketData(prev => ({
        ...prev,
        historical: {
          ...prev.historical,
          [symbol]: response.data
        }
      }));
    } catch (error) {
      setMarketData(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to fetch historical data'
      }));
    } finally {
      setMarketData(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchMarketOverview = async () => {
    setMarketData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await marketAPI.getMarketOverview();
      setMarketData(prev => ({
        ...prev,
        overview: response.data
      }));
    } catch (error) {
      setMarketData(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to fetch market overview'
      }));
    } finally {
      setMarketData(prev => ({ ...prev, loading: false }));
    }
  };

  const searchStocks = async (query) => {
    try {
      const response = await marketAPI.searchStocks(query);
      return response.data.results;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search stocks');
    }
  };

  return {
    ...marketData,
    fetchQuotes,
    fetchHistoricalData,
    fetchMarketOverview,
    searchStocks
  };
};
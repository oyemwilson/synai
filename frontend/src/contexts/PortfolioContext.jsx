import React, { createContext, useState, useContext } from 'react';
import { portfolioAPI } from '../services/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await portfolioAPI.getOverview();
      setPortfolio(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch portfolio');
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (investmentData) => {
    try {
      await portfolioAPI.addInvestment(investmentData);
      await fetchPortfolio(); // Refresh portfolio
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add investment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const removeInvestment = async (investmentId) => {
    try {
      await portfolioAPI.removeInvestment(investmentId);
      await fetchPortfolio(); // Refresh portfolio
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove investment';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const runSimulation = async (simulationData) => {
    try {
      const response = await portfolioAPI.runSimulation(simulationData);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to run simulation';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    portfolio,
    loading,
    error,
    fetchPortfolio,
    addInvestment,
    removeInvestment,
    runSimulation,
    refreshPortfolio: fetchPortfolio
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
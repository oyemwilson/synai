import React, { useState } from 'react';
import { marketAPI } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AddInvestmentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: '',
    purchasePrice: '',
    sector: 'Technology'
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const investmentTypes = [
    { value: 'stock', label: 'Stock' },
    { value: 'etf', label: 'ETF' },
    { value: 'bond', label: 'Bond' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' }
  ];

  const sectors = [
    'Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial',
    'Energy', 'Utilities', 'Real Estate', 'Materials', 'Communication'
  ];

  const handleSearchStocks = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await marketAPI.searchStocks(query);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectStock = (stock) => {
    setFormData(prev => ({
      ...prev,
      symbol: stock.symbol,
      name: stock.name
    }));
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    if (!formData.symbol || !formData.quantity || !formData.purchasePrice) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const submissionData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice)
    };

    const result = await onSubmit(submissionData);
    setLoading(false);
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to add investment');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-search when symbol changes
    if (field === 'symbol' && value.length >= 2) {
      handleSearchStocks(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Investment</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Symbol Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {searching && (
                <div className="absolute right-3 top-2">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stock Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Apple Inc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Investment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {investmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              value={formData.sector}
              onChange={(e) => handleChange('sector', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Purchase Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', e.target.value)}
                placeholder="e.g., 150.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Total Cost Preview */}
          {formData.quantity && formData.purchasePrice && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="text-sm text-blue-800">
                Total Cost: ${(parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)).toFixed(2)}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="small" text="Adding..." /> : 'Add Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
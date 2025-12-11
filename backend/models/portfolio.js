import mongoose from 'mongoose';

const assetAllocationSchema = new mongoose.Schema({
  stocks: { type: Number, default: 0 },
  bonds: { type: Number, default: 0 },
  etfs: { type: Number, default: 0 },
  cryptocurrencies: { type: Number, default: 0 },
  realEstate: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  other: { type: Number, default: 0 }
});

const portfolioSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    default: 'My Investment Portfolio' 
  },
  totalValue: { 
    type: Number, 
    default: 0 
  },
  initialInvestment: { 
    type: Number, 
    default: 0 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  riskLevel: { 
    type: String, 
    enum: ['conservative', 'moderate', 'aggressive'],
    default: 'moderate'
  },
  assetAllocation: assetAllocationSchema,
  investments: [{
    symbol: String,
    name: String,
    type: { 
      type: String, 
      enum: ['stock', 'bond', 'etf', 'crypto', 'real-estate', 'other'] 
    },
    quantity: Number,
    purchasePrice: Number,
    currentPrice: Number,
    purchaseDate: Date,
    sector: String,
    performance: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      yearly: Number
    }
  }],
  performance: {
    totalReturn: { type: Number, default: 0 },
    dailyChange: { type: Number, default: 0 },
    monthlyChange: { type: Number, default: 0 },
    yearlyChange: { type: Number, default: 0 }
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  
  analytics: {
    lastCalculated: Date,
    riskMetrics: {
      sharpeRatio: Number,
      valueAtRisk: Number,
      beta: Number,
      volatility: String,
      maxDrawdown: String
    },
    diversification: {
      score: Number,
      sectors: Number,
      sectorWeights: Map,
      herfindahlIndex: Number
    },
    overallRiskScore: {
      score: Number,
      level: String,
      components: {
        sharpeScore: Number,
        betaScore: Number,
        diversificationScore: Number
      }
    }
  }
}, {
  timestamps: true
});

// Auto-update lastUpdated when portfolio changes
portfolioSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model('Portfolio', portfolioSchema);
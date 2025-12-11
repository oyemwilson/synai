import {
  getQuotes,
  getHistoricalData,
  searchStocks,
  getMarketOverview,
  testFMPConnection
} from '../controllers/marketController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const marketRoutes = async (fastify, options) => {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/quotes', getQuotes);
  fastify.get('/historical/:symbol', getHistoricalData);
  fastify.get('/search', searchStocks);
  fastify.get('/overview', getMarketOverview);
  // In routes/marketRoutes.js - add the test endpoint
fastify.get('/test-fmp', testFMPConnection);
};

export default marketRoutes;
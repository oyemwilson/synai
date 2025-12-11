// routes/portfolioRoutes.js

import {
  getPortfolioOverview,
  addInvestment,
  removeInvestment,
  runSimulation,
  getPerformanceHistory
} from '../controllers/portfolioController.js';

// 1. Import your actual authentication function
import authMiddleware from '../middleware/authMiddleware.js'; 

const portfolioRoutes = async (fastify, options) => {
  
  // 2. Use addHook('preHandler', ...) to apply the middleware
  //    This runs the middleware before every route handler in this plugin.
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/overview', getPortfolioOverview);
  fastify.post('/investments', addInvestment);
  fastify.delete('/investments/:investmentId', removeInvestment);
  fastify.post('/simulation', runSimulation);
  fastify.get('/performance', getPerformanceHistory);
};

export default portfolioRoutes;
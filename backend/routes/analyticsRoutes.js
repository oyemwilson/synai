import {
  getPortfolioAnalytics,
  runMonteCarloSimulation,
  getEfficientFrontier
} from '../controllers/analyticsController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const analyticsRoutes = async (fastify, options) => {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/analytics', getPortfolioAnalytics);
  fastify.post('/monte-carlo', runMonteCarloSimulation);
  fastify.get('/efficient-frontier', getEfficientFrontier);
};

export default analyticsRoutes;
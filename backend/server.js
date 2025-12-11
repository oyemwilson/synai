import Fastify from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// FIX 1: Import the CORS plugin
import cors from '@fastify/cors'; 

// Import plugins
import websocket from '@fastify/websocket'; 

// Import services and routes
import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import websocketService from './services/websocketService.js';


// Load env variables before using them
dotenv.config();

const fastify = Fastify({ logger: true });

// --- PLUGIN REGISTRATION ---

// Register WebSocket plugin FIRST if routes depend on it
fastify.register(websocket, {
  options: {
    maxPayload: 1048576, // 1MB max payload
  }
});

// Register CORS
fastify.register(cors, {
  origin: ['http://localhost:3000'], // Frontend port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// Initialize WebSocket Service AFTER registering the plugin
websocketService.initialize(fastify);

console.log('✅ WebSocket plugin registered');

// --- DATABASE CONNECTION ---

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// --- ROUTE REGISTRATION ---

// Register routes with prefix
fastify.register(authRoutes, { prefix: '/api/auth' });
// Register portfolio routes
fastify.register(portfolioRoutes, { prefix: '/api/portfolio' });
// Register market routes
fastify.register(marketRoutes, { prefix: '/api/market' });
// Register analytics routes
fastify.register(analyticsRoutes, { prefix: '/api/analytics' });


// Add a route to check WebSocket stats (optional)
fastify.get('/websocket-stats', async (request, reply) => {
  reply.send(websocketService.getStats());
});


// --- SERVER START ---
const start = async () => {
  try {
    await fastify.listen({ 
      port: parseInt(process.env.PORT) || 3000,
      host: '0.0.0.0' // Allow external connections
    });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
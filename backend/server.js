import Fastify from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

// Load env variables before using them
dotenv.config();

const fastify = Fastify({ logger: true });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Register routes with prefix
fastify.register(authRoutes, { prefix: '/api/auth' });

// Start server
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
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const authMiddleware = async (request, reply) => {
  try {
    // Get token from header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return reply.code(401).send({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return reply.code(401).send({ message: 'User no longer exists' });
    }

    // Add user to request object
    request.user = user;
    request.userId = user._id;

    // Continue to the route handler
    return;
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return reply.code(401).send({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return reply.code(401).send({ message: 'Token expired' });
    }
    
    return reply.code(500).send({ message: 'Server error in authentication' });
  }
};

export default authMiddleware;
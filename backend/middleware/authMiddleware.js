import jwt from 'jsonwebtoken';

const authMiddleware = async (request, reply) => {
  const token = request.headers.authorization?.split(' ')[1];
  if (!token) {
    return reply.code(401).send({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    request.userId = decoded.id;
    return; // Need to return to continue to next handler
  } catch (error) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
};

export default authMiddleware;
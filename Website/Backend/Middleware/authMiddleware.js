import { verifyToken } from '../utils/jwt.js';
import { findUserById, sanitizeUser } from '../db/userStore.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const payload = verifyToken(token);
    const user = await findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = sanitizeUser(user);
    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

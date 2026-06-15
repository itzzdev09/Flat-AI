export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if ((req.user.role || 'user') !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
};

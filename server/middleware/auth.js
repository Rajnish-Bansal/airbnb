const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('[AUTH FAILED] No token provided');
    return res.status(401).json({ message: 'No authentication token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH SUCCESS] User:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH FAILED] Token starts with:', token.substring(0, 15), 'Error:', err.message);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};

exports.authenticateToken = auth;

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
};

exports.authorizeAdmin = authorizeAdmin;

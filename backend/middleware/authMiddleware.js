import jwt from 'jsonwebtoken';

/**
 * authMiddleware.js
 * Protects admin routes by verifying the administrative JWT token.
 * Accepts ONLY the 'Authorization: Bearer <token>' header.
 * Returns 401 for missing, invalid, or expired tokens.
 */
export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Administrative authentication token is required.'
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Administrative authentication token is required.'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: JWT_SECRET is not configured.'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = {
      username: decoded.username,
      role: decoded.role || 'Administrator'
    };
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired administrative token.'
    });
  }
};

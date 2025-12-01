const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Acceso denegado. No se proporcionó token de autenticación' 
      });
    }

    // El formato esperado es "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        message: 'Acceso denegado. Token inválido' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado' 
      });
    } else {
      console.error('Error en middleware de autenticación:', error);
      return res.status(500).json({ 
        message: 'Error interno del servidor' 
      });
    }
  }
};

// Middleware para verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso' 
      });
    }

    next();
  };
};

// Middleware para verificar que sea patronista
const requirePatronista = requireRole(['patronista']);

// Middleware para verificar que sea cliente
const requireCliente = requireRole(['cliente']);

// Middleware para verificar que sea administrador
const requireAdmin = requireRole(['admin']);

module.exports = {
  auth: authMiddleware,
  requireRole,
  requirePatronista,
  requireCliente,
  requireAdmin
};
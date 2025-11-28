require('dotenv').config();

module.exports = {
  // Puerto del servidor
  PORT: process.env.PORT || 3000,

  // Ambiente
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Base de datos
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'tu-clave-secreta-cambiar-en-produccion',
  JWT_EXPIRATION: '24h',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:5000', 'http://localhost:3000'],

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',

  // Multer - Archivos
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'server/uploads',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100
};

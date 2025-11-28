const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Puerto del servidor
  PORT: process.env.BACKEND_PORT || 3002,
  
  // Entorno
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Base de datos
  DATABASE: {
    PATH: process.env.DB_PATH || './database.sqlite',
  },
  
  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_aqui',
    EXPIRES_IN: '7d',
  },
  
  // CORS
  CORS: {
    ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
    CREDENTIALS: true,
  },
  
  // Archivos
  UPLOAD: {
    DIR: process.env.UPLOAD_DIR || './server/uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    ALLOWED_TYPES: {
      IMAGES: ['.jpg', '.jpeg', '.png', '.webp'],
      PATTERNS: ['.pds', '.rul', '.ptn'],
      DOCUMENTS: ['.pdf'],
    },
  },
  
  // Email (para futuro)
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
  },
  
  // Pagos
  PAYU: {
    API_URL: process.env.PAYU_API_URL || 'https://sandbox.api.payulatam.com',
    MERCHANT_ID: process.env.PAYU_MERCHANT_ID || '',
    ACCOUNT_ID: process.env.PAYU_ACCOUNT_ID || '',
    API_KEY: process.env.PAYU_API_KEY || '',
    API_LOGIN: process.env.PAYU_API_LOGIN || '',
  },
};

module.exports = config;
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const config = require('./config');
const db = require('./models/database');

const app = express();
const PORT = config.PORT;

// Configuración de seguridad y límites
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Aumentar límites para evitar error 431
app.use(express.json({ 
  limit: '50mb',
  parameterLimit: 50000
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '50mb',
  parameterLimit: 50000
}));

// Configuración específica para manejar headers largos
app.use((req, res, next) => {
  // Aumentar límite de headers
  req.setTimeout(300000); // 5 minutos
  res.setTimeout(300000);
  
  // Headers para evitar problemas de cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  next();
});

// Configuración de CORS mejorada
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://ceb-molderia-web.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400 // 24 horas
}));

// Middleware de compresión
app.use(compression());

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base de datos
// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin')); // Rutas de administrador

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    await db.initialize();
    console.log('Base de datos inicializada correctamente');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
      console.log(`Salud del servidor: http://localhost:${PORT}/api/health`);
      console.log(`Servidor también disponible en: http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();
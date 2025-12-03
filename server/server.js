const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const multer = require('multer');
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

// Configurar multer para manejar multipart/form-data
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Usar upload.fields para capturar archivos específicos Y campos de texto
app.use(upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'files', maxCount: 10 }
]));

// Middleware para combinar req.body y req.fields (en caso de que multer ponga datos en otro lugar)
app.use((req, res, next) => {
  if (req.files && typeof req.files === 'object') {
    // req.files es un objeto como { images: [...], files: [...] }
    Object.keys(req.files).forEach(fieldName => {
      if (Array.isArray(req.files[fieldName])) {
        req.body[fieldName] = req.files[fieldName];
      }
    });
  }
  next();
});

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
  'https://ceb-morder-a.onrender.com',
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

// Servir archivos estáticos del frontend React (DESPUÉS de las rutas /api)
// Esto se hará al final, antes de la ruta catch-all

// Middleware de logging para debug - MUY VISIBLE
app.use((req, res, next) => {
  if (req.path.includes('/api/products')) {
    console.log('='.repeat(50));
    console.log(`🔍 PETICIÓN RECIBIDA: ${req.method} ${req.path}`);
    console.log(`🔍 URL COMPLETA: ${req.url}`);
    console.log(`🔍 HEADERS: ${req.headers.authorization ? 'CON TOKEN' : 'SIN TOKEN'}`);
    console.log('='.repeat(50));
  }
  next();
});

// Base de datos
// Rutas
console.log('📌 Registrando ruta: /api/auth');
app.use('/api/auth', require('./routes/auth'));
console.log('📌 Registrando ruta: /api/products');
app.use('/api/products', require('./routes/products'));
console.log('📌 Registrando ruta: /api/catalog');
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin')); // Rutas de administrador
app.use('/api/payments', require('./routes/payments')); // Rutas de pagos Wompi
app.use('/api/files', require('./routes/files')); // Descargas de archivos protegidas

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de salud de base de datos (simple)
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT current_database() as db, inet_server_addr() as host');
    res.json({
      database: result.rows[0]?.db || 'desconocida',
      host: result.rows[0]?.host || 'desconocido'
    });
  } catch (error) {
    console.error('Health DB error:', error);
    res.status(500).json({ message: 'DB no disponible' });
  }
});

// Ruta para inspeccionar el esquema de la BD (diagnóstico)
app.get('/api/health/schema', async (req, res) => {
  try {
    // Obtener información de todas las tablas y columnas
    const result = await db.query(`
      SELECT 
        t.tablename,
        array_agg(a.attname ORDER BY a.attnum) as columns
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0
      WHERE t.schemaname = 'public'
      GROUP BY t.tablename
      ORDER BY t.tablename
    `);
    
    res.json({
      tables: result.rows,
      message: 'Esquema de la BD actual'
    });
  } catch (error) {
    console.error('Schema inspection error:', error);
    res.status(500).json({ message: 'Error inspeccionando esquema', error: error.message });
  }
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
    
    // Sincronizar categorías automáticamente
    try {
      const pool = db.getPool();
      const categories = [
        { name: 'Blusa', description: 'Blusas de todos los estilos' },
        { name: 'Camisa', description: 'Camisas variadas' },
        { name: 'Vestido', description: 'Vestidos de diferentes tipos' },
        { name: 'Falda', description: 'Faldas de diferentes estilos' },
        { name: 'Pantalón', description: 'Pantalones y jeans' },
        { name: 'Short', description: 'Shorts variados' },
        { name: 'Chaqueta', description: 'Chaquetas y blazers' },
        { name: 'Abrigo', description: 'Abrigos de invierno' },
        { name: 'Ropa Interior', description: 'Ropa interior y lencería' },
        { name: 'Traje de Baño', description: 'Trajes de baño' },
        { name: 'Ropa Deportiva', description: 'Prendas deportivas' },
        { name: 'Otro', description: 'Otras prendas' },
        { name: 'Blusas', description: 'Blusas de todos los estilos' },
        { name: 'Camisas', description: 'Camisas variadas' },
        { name: 'Vestidos', description: 'Vestidos de diferentes tipos' },
        { name: 'Faldas', description: 'Faldas de diferentes estilos' },
        { name: 'Pantalones', description: 'Pantalones y jeans' },
        { name: 'Shorts', description: 'Shorts variados' },
        { name: 'Chaquetas', description: 'Chaquetas y blazers' },
        { name: 'Abrigos', description: 'Abrigos de invierno' }
      ];

      let inserted = 0;
      for (const category of categories) {
        const result = await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
          [category.name, category.description]
        );
        if (result.rows.length > 0) {
          inserted++;
        }
      }
      console.log(`✅ Sincronización de categorías en startup: ${inserted} nuevas insertadas`);
    } catch (syncError) {
      console.error('⚠️  Error sincronizando categorías en startup:', syncError.message);
      // No fallar el servidor por esto
    }

    // ========== SERVIR FRONTEND REACT ==========
    // Servir los archivos estáticos del build de React
    const buildPath = path.join(__dirname, '..', 'build');
    app.use(express.static(buildPath));
    
    // Para rutas que no son /api/*, servir index.html (React Router maneja el resto)
    app.get('*', (req, res) => {
      // Si es una ruta API que no existe, devolver 404
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'Ruta no encontrada' });
      }
      // Para cualquier otra ruta, servir index.html (React Router lo maneja)
      res.sendFile(path.join(buildPath, 'index.html'));
    });
    
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
const express = require('express');
const database = require('../models/database');
const { auth, requirePatronista } = require('../middleware/auth');

const router = express.Router();

console.log('🚀 ARCHIVO products.js CARGADO - Registrando rutas...');

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const pool = database.getPool();
    
    // Query básico para obtener productos activos
    const query = `
      SELECT 
        p.*,
        u."firstName" as "patronistaFirstName",
        u."lastName" as "patronistaLastName",
        c.name as "categoryName"
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.active = true
      ORDER BY p."createdAt" DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error en GET /products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta de test para verificar autenticación
router.get('/test-auth', auth, async (req, res) => {
  console.log('🧪 TEST AUTH - Usuario:', req.user);
  res.json({ 
    success: true, 
    user: req.user,
    message: 'Autenticación funcionando correctamente' 
  });
});

// RUTA TEMPORAL DE PRUEBA - SIN AUTH
router.get('/my-products-test', async (req, res) => {
  console.log('🧪 ENDPOINT /my-products-test EJECUTÁNDOSE (SIN AUTH)');
  res.json({ 
    success: true, 
    message: 'Ruta /my-products-test funciona correctamente',
    timestamp: new Date().toISOString()
  });
});

// Obtener productos del patronista autenticado (debe ir ANTES de /:id)
router.get('/my-products', auth, async (req, res) => {
  console.log('🔥 ENDPOINT /my-products EJECUTÁNDOSE');
  
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const pool = database.getPool();

    console.log('📋 GET /my-products - Usuario:', userId, 'Rol:', userRole);

    // Verificar que sea patronista
    if (userRole !== 'patronista') {
      console.log('❌ Usuario no es patronista');
      return res.status(403).json({ 
        message: 'Solo los patronistas pueden acceder a sus productos' 
      });
    }

    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p."basicPrice",
        p."trainingPrice",
        p.difficulty,
        p.sizes,
        p.active,
        p."createdAt",
        p."updatedAt",
        p."categoryId",
        c.name as "categoryName"
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p."patronistaId" = $1
      ORDER BY p."createdAt" DESC
    `;

    const result = await pool.query(query, [userId]);
    console.log('✅ Productos encontrados:', result.rows.length);
    res.json(result.rows);

  } catch (error) {
    console.error('❌ Error en GET /my-products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = database.getPool();

    const query = `
      SELECT 
        p.*,
        u."firstName" as "patronistaFirstName",
        u."lastName" as "patronistaLastName",
        c.name as "categoryName"
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.id = $1 AND p.active = true
    `;

    const result = await pool.query(query, [id]);
    const product = result.rows[0];

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);

  } catch (error) {
    console.error('Error en GET /products/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear producto (solo patronistas)
router.post('/', auth, requirePatronista, async (req, res) => {
  try {
    console.log('📝 POST /products iniciado');
    console.log('req.body keys:', Object.keys(req.body));
    console.log('req.files:', req.files ? req.files.length : 'no files');
    
    // El campo viene como 'category' del frontend, no 'categoryId'
    const { title, description, category, basicPrice, trainingPrice, difficulty, sizes } = req.body;
    const patronistaId = req.user.userId;

    console.log('Valores parseados:', { title, description, category, basicPrice, trainingPrice, difficulty, sizes });

    // Validaciones
    if (!title || !basicPrice) {
      console.log('❌ Validación fallida: falta title o basicPrice');
      return res.status(400).json({ 
        message: 'Título y precio básico son requeridos' 
      });
    }

    if (basicPrice <= 0 || (trainingPrice && trainingPrice <= 0)) {
      return res.status(400).json({ 
        message: 'Los precios deben ser mayores a 0' 
      });
    }

    const pool = database.getPool();

    // Buscar el ID de la categoría por nombre
    let categoryId = null;
    if (category) {
      const categoryQuery = 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)';
      const categoryResult = await pool.query(categoryQuery, [category]);
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        console.log('⚠️  Categoría no encontrada:', category);
        // Opcionalmente, podrías crear la categoría o devolver error
      }
    }

    const query = `
      INSERT INTO products ("patronistaId", title, description, "categoryId", "basicPrice", "trainingPrice", difficulty, sizes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    console.log('Ejecutando query con:', [
      patronistaId, 
      title, 
      description, 
      categoryId,
      basicPrice, 
      trainingPrice, 
      difficulty, 
      sizes
    ]);

    const result = await pool.query(query, [
      patronistaId, 
      title, 
      description, 
      categoryId,
      basicPrice, 
      trainingPrice, 
      difficulty, 
      JSON.stringify(sizes)
    ]);

    console.log('✅ Producto creado:', result.rows[0].id);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      productId: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Error en POST /products:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

console.log('✅ Rutas de products.js registradas correctamente');
console.log('   - GET /');
console.log('   - GET /test-auth');
console.log('   - GET /my-products ⭐');
console.log('   - GET /:id');
console.log('   - POST /');

module.exports = router;

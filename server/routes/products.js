const express = require('express');
const fs = require('fs');
const path = require('path');
const database = require('../models/database');
const { auth, requirePatronista } = require('../middleware/auth');

const router = express.Router();

// Asegurar que exista la carpeta de uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('🚀 ARCHIVO products.js CARGADO - Registrando rutas...');

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const pool = database.getPool();
    
    // Query básico para obtener productos activos con archivos
    const query = `
      SELECT 
        p.*,
        u."firstName" as "patronistaFirstName",
        u."lastName" as "patronistaLastName",
        c.name as "categoryName",
        COALESCE(json_agg(
          json_build_object(
            'id', pf.id,
            'fileName', pf."fileName",
            'originalName', pf."originalName",
            'filePath', pf."filePath",
            'fileType', pf."fileType",
            'fileSize', pf."fileSize",
            'createdAt', pf."createdAt"
          ) 
          ORDER BY pf.id ASC
        ) FILTER (WHERE pf.id IS NOT NULL), '[]'::json) as files
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN product_files pf ON p.id = pf."productId"
      WHERE p.active = true
      GROUP BY p.id, u."firstName", u."lastName", c.name
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
        c.name as "categoryName",
        COALESCE(json_agg(
          json_build_object(
            'id', pf.id,
            'fileName', pf."fileName",
            'originalName', pf."originalName",
            'filePath', pf."filePath",
            'fileType', pf."fileType",
            'fileSize', pf."fileSize",
            'createdAt', pf."createdAt"
          ) 
          ORDER BY pf.id ASC
        ) FILTER (WHERE pf.id IS NOT NULL), '[]'::json) as files
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN product_files pf ON p.id = pf."productId"
      WHERE p."patronistaId" = $1
      GROUP BY p.id, c.name
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
        c.name as "categoryName",
        COALESCE(json_agg(
          json_build_object(
            'id', pf.id,
            'fileName', pf."fileName",
            'originalName', pf."originalName",
            'filePath', pf."filePath",
            'fileType', pf."fileType",
            'fileSize', pf."fileSize",
            'createdAt', pf."createdAt"
          ) 
          ORDER BY pf.id ASC
        ) FILTER (WHERE pf.id IS NOT NULL), '[]'::json) as files
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN product_files pf ON p.id = pf."productId"
      WHERE p.id = $1 AND p.active = true
      GROUP BY p.id, u."firstName", u."lastName", c.name
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
    console.log('req.files disponibles:', req.files ? Object.keys(req.files) : 'no files');
    
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

    // Validar que haya al menos una imagen
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      console.log('❌ Validación fallida: se requiere al menos una imagen');
      return res.status(400).json({ 
        message: 'Se requiere al menos una imagen del producto' 
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
      }
    }

    // Insertar producto primero para obtener el ID
    const query = `
      INSERT INTO products ("patronistaId", title, description, "categoryId", "basicPrice", "trainingPrice", difficulty, sizes, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    console.log('Ejecutando INSERT con:', [
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
      parseFloat(basicPrice), 
      trainingPrice ? parseFloat(trainingPrice) : null, 
      difficulty || null, 
      sizes ? JSON.stringify(sizes) : null,
      true
    ]);

    const productId = result.rows[0].id;
    console.log('✅ Producto creado con ID:', productId);

    // NO crear directorio - guardaremos en BD en lugar de disco
    // const productDir = path.join(uploadsDir, String(productId));
    // if (!fs.existsSync(productDir)) {
    //   fs.mkdirSync(productDir, { recursive: true });
    // }

    // Guardar imágenes en la tabla product_files (en BD, no en disco)
    if (req.files.images) {
      for (const image of req.files.images) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `img_${timestamp}_${randomStr}_${image.originalname}`;
        
        // Registrar en BD CON los datos del archivo en fileData
        const fileQuery = `
          INSERT INTO product_files ("productId", "fileName", "originalName", "fileType", "fileSize", "fileData")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        await pool.query(fileQuery, [
          productId,
          fileName,
          image.originalname,
          'image',
          image.size,
          image.buffer  // Guardar el buffer directamente en BYTEA
        ]);
        
        console.log('✅ Imagen registrada en BD:', fileName);
      }
    }

    // Guardar archivos de patrones en la tabla product_files (en BD, no en disco)
    if (req.files.files) {
      for (const file of req.files.files) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `pattern_${timestamp}_${randomStr}_${file.originalname}`;
        
        // Registrar en BD CON los datos del archivo en fileData
        const fileQuery = `
          INSERT INTO product_files ("productId", "fileName", "originalName", "fileType", "fileSize", "fileData")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        await pool.query(fileQuery, [
          productId,
          fileName,
          file.originalname,
          'pattern',
          file.size,
          file.buffer  // Guardar el buffer directamente en BYTEA
        ]);
        
        console.log('✅ Patrón registrado en BD:', fileName);
      }
    }

    // Obtener el producto con todos sus archivos
    const selectQuery = `
      SELECT 
        p.*,
        c.name as "categoryName",
        COALESCE(json_agg(
          json_build_object(
            'id', pf.id,
            'fileName', pf."fileName",
            'originalName', pf."originalName",
            'filePath', pf."filePath",
            'fileType', pf."fileType",
            'fileSize', pf."fileSize",
            'createdAt', pf."createdAt"
          ) 
          ORDER BY pf.id ASC
        ) FILTER (WHERE pf.id IS NOT NULL), '[]'::json) as files
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN product_files pf ON p.id = pf."productId"
      WHERE p.id = $1
      GROUP BY p.id, c.name
    `;

    const productResult = await pool.query(selectQuery, [productId]);
    const productComplete = productResult.rows[0];

    if (!productComplete) {
      console.error('❌ Error: Producto no encontrado después de crear');
      return res.status(500).json({ 
        message: 'Error: Producto creado pero no se pudo recuperar de la BD',
        productId: productId
      });
    }

    console.log('✅ Producto creado exitosamente con archivos');

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: productComplete
    });

  } catch (error) {
    console.error('❌ Error en POST /products:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error.message,
      detail: error.detail || 'Sin detalles adicionales'
    });
  }
});

// Descargar archivo de producto
router.get('/files/:productId/:fileName', async (req, res) => {
  try {
    const { productId, fileName } = req.params;
    
    // Validar que productId sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const filePath = path.join(uploadsDir, String(productId), fileName);
    
    // Validar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo no encontrado:', filePath);
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    // Enviar archivo
    res.download(filePath);
    
  } catch (error) {
    console.error('❌ Error descargando archivo:', error.message);
    res.status(500).json({ message: 'Error descargando archivo', error: error.message });
  }
});

console.log('✅ Rutas de products.js registradas correctamente');
console.log('   - GET /');
console.log('   - GET /test-auth');
console.log('   - GET /my-products ⭐');
console.log('   - GET /:id');
console.log('   - GET /files/:productId/:fileName (Descargar archivos)');
console.log('   - POST /');

module.exports = router;

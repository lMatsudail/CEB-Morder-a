const express = require('express');
const fs = require('fs');
const path = require('path');
const database = require('../models/database');
const { auth, requirePatronista } = require('../middleware/auth');
// Almacenamiento en BD: no usamos almacenamiento en disco aquí

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

    // Guardar archivos directamente en BD (BYTEA) usando buffers de multer (Render sin disco persistente)
    const filesFromMulter = req.files || {};
    const toInsert = [];

    const now = Date.now();
    const sanitizeName = (name = '') => name.replace(/[^\w\-.]+/g, '_');

    if (filesFromMulter.images && Array.isArray(filesFromMulter.images)) {
      for (const file of filesFromMulter.images) {
        toInsert.push({
          productId,
          fileName: `${now}-${Math.random().toString(36).slice(2,8)}-${sanitizeName(file.originalname)}`,
          originalName: file.originalname,
          fileType: 'image',
          fileSize: file.size,
          fileData: file.buffer
        });
      }
    }
    if (filesFromMulter.files && Array.isArray(filesFromMulter.files)) {
      for (const file of filesFromMulter.files) {
        toInsert.push({
          productId,
          fileName: `${now}-${Math.random().toString(36).slice(2,8)}-${sanitizeName(file.originalname)}`,
          originalName: file.originalname,
          fileType: 'pattern',
          fileSize: file.size,
          fileData: file.buffer
        });
      }
    }

    if (toInsert.length > 0) {
      const insertQuery = `
        INSERT INTO product_files ("productId", "fileName", "originalName", "fileType", "fileSize", "fileData")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      for (const f of toInsert) {
        const r = await pool.query(insertQuery, [
          f.productId,
          f.fileName,
          f.originalName,
          f.fileType,
          f.fileSize,
          f.fileData
        ]);
        console.log(`✅ Archivo registrado en BD: ${f.fileType} -> id ${r.rows[0]?.id}`);
      }
    }

    // Procesar URLs externas de imágenes (por ejemplo, Cloudinary)
    let imageUrls = [];
    if (req.body && req.body.imageUrls) {
      try {
        // Aceptar tanto JSON string como array plano enviado por form-data
        if (typeof req.body.imageUrls === 'string') {
          imageUrls = JSON.parse(req.body.imageUrls);
        } else if (Array.isArray(req.body.imageUrls)) {
          imageUrls = req.body.imageUrls;
        }
      } catch (e) {
        console.warn('⚠️  imageUrls no es JSON válido, ignorando:', req.body.imageUrls);
      }
    }

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const insertUrlQuery = `
        INSERT INTO product_files ("productId", "fileName", "originalName", "fileType", "fileSize", "externalUrl")
        VALUES ($1, $2, $3, 'image', NULL, $4)
        RETURNING id
      `;
      for (const url of imageUrls) {
        const urlStr = String(url).trim();
        if (!urlStr) continue;
        const fileName = sanitizeName(urlStr.split('/').pop() || `image_${now}`);
        const r = await pool.query(insertUrlQuery, [
          productId,
          fileName,
          fileName,
          urlStr
        ]);
        console.log(`✅ Imagen URL registrada: ${urlStr} -> id ${r.rows[0]?.id}`);
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

// Obtener producto por ID (público) - DEBE IR ANTES DE /files
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const pool = database.getPool();
    
    const query = `
      SELECT 
        p.*,
        u."firstName" as "userFirstName",
        u."lastName" as "userLastName",
        c.name as "categoryName"
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      WHERE p.id = $1 AND p.active = true
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error en GET /products/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar producto (solo patronista propietario)
router.put('/:id', auth, requirePatronista, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, category, difficulty, sizes, basicPrice, trainingPrice, active, imageUrls } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const pool = database.getPool();

    // Verificar que el producto pertenece al patronista
    const checkQuery = 'SELECT "patronistaId" FROM products WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (checkResult.rows[0].patronistaId !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este producto' });
    }

    // Buscar el ID de la categoría por nombre (igual que en POST)
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

    // Actualizar producto
    const updateQuery = `
      UPDATE products 
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        "categoryId" = COALESCE($4, "categoryId"),
        difficulty = COALESCE($5, difficulty),
        sizes = COALESCE($6, sizes),
        "basicPrice" = COALESCE($7, "basicPrice"),
        "trainingPrice" = COALESCE($8, "trainingPrice"),
        active = COALESCE($9, active),
        "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      id,
      title,
      description,
      categoryId,
      difficulty,
      sizes ? JSON.stringify(sizes) : null,
      basicPrice,
      trainingPrice,
      active
    ]);

    const productId = result.rows[0].id;

    // Procesar archivos nuevos si los hay
    const filesFromMulter = req.files || {};
    
    // Procesar imágenes subidas
    if (filesFromMulter.images && Array.isArray(filesFromMulter.images)) {
      for (const file of filesFromMulter.images) {
        const insertQuery = `
          INSERT INTO product_files (
            "productId", "fileName", "originalName", "fileType", "fileSize", "fileData"
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `;
        await pool.query(insertQuery, [
          productId,
          `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file.originalname,
          'image',
          file.size,
          file.buffer
        ]);
        console.log('✅ Imagen actualizada en BD');
      }
    }

    // Procesar patrones subidos
    if (filesFromMulter.files && Array.isArray(filesFromMulter.files)) {
      for (const file of filesFromMulter.files) {
        const insertQuery = `
          INSERT INTO product_files (
            "productId", "fileName", "originalName", "fileType", "fileSize", "fileData"
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `;
        await pool.query(insertQuery, [
          productId,
          `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file.originalname,
          'pattern',
          file.size,
          file.buffer
        ]);
        console.log('✅ Patrón actualizado en BD');
      }
    }

    // Procesar URLs de imágenes externas si las hay
    if (imageUrls) {
      let parsedUrls = [];
      try {
        parsedUrls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      } catch (e) {
        parsedUrls = [];
      }

      if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
        for (const url of parsedUrls) {
          if (url && /^(https?:)?\/\//.test(url)) {
            const insertQuery = `
              INSERT INTO product_files (
                "productId", "fileName", "originalName", "fileType", "externalUrl", "fileSize"
              ) VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id
            `;
            await pool.query(insertQuery, [
              productId,
              `external_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              url,
              'image',
              url,
              0
            ]);
            console.log('✅ Imagen URL registrada en actualización');
          }
        }
      }
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error en PUT /products/:id:', error.message);
    res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error.message
    });
  }
});

// Eliminar producto (solo patronista propietario)
router.delete('/:id', auth, requirePatronista, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const pool = database.getPool();

    // Verificar que el producto pertenece al patronista
    const checkQuery = 'SELECT "patronistaId" FROM products WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (checkResult.rows[0].patronistaId !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este producto' });
    }

    // Eliminar producto (CASCADE eliminará archivos relacionados)
    const deleteQuery = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await pool.query(deleteQuery, [id]);

    res.json({
      message: 'Producto eliminado exitosamente',
      productId: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Error en DELETE /products/:id:', error.message);
    res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error.message
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
console.log('   - PUT /:id');
console.log('   - DELETE /:id');
console.log('   - GET /files/:productId/:fileName (Descargar archivos)');
console.log('   - POST /');

module.exports = router;

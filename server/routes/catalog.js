const express = require('express');
const database = require('../models/database');

const router = express.Router();

// Obtener catálogo de productos públicos
router.get('/products', async (req, res) => {
  try {
    const pool = database.getPool();

    // Query para obtener productos activos con sus archivos agregados como JSON
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p."basicPrice",
        p."trainingPrice",
        p.difficulty,
        p.sizes,
        p."createdAt",
        u."firstName" as patronistafirstname,
        u."lastName" as patronistalastname,
        c.name as categoryname,
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
    const products = result.rows;

    // Formatear los productos para el frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      basicPrice: product.basicPrice,
      trainingPrice: product.trainingPrice,
      difficulty: product.difficulty,
      sizes: (() => {
        try {
          // Intentar parsear como JSON primero
          return JSON.parse(product.sizes || '[]');
        } catch {
          // Si falla, asumir que es una cadena separada por comas
          return product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
        }
      })(),
      files: product.files || [],
      patronista: `${product.patronistafirstname || ''} ${product.patronistalastname || ''}`.trim(),
      category: product.categoryname,
      createdAt: product.createdAt
    }));

    res.json({
      success: true,
      products: formattedProducts
    });

  } catch (error) {
    console.error('Error en GET /catalog/products:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener producto específico del catálogo
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = database.getPool();

    const query = `
      SELECT 
        p.*,
        u."firstName" as patronistafirstname,
        u."lastName" as patronistalastname,
        c.name as categoryname,
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
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Formatear el producto para el frontend
    const formattedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      basicPrice: product.basicPrice,
      trainingPrice: product.trainingPrice,
      difficulty: product.difficulty,
      sizes: (() => {
        try {
          // Intentar parsear como JSON primero
          return JSON.parse(product.sizes || '[]');
        } catch {
          // Si falla, asumir que es una cadena separada por comas
          return product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
        }
      })(),
      files: product.files || [],
      patronista: `${product.patronistafirstname || ''} ${product.patronistalastname || ''}`.trim(),
      category: product.categoryname,
      createdAt: product.createdAt
    };

    res.json({
      success: true,
      product: formattedProduct
    });

  } catch (error) {
    console.error('Error en GET /catalog/products/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
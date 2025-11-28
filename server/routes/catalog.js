const express = require('express');
const database = require('../models/database');

const router = express.Router();

// Obtener catálogo de productos públicos
router.get('/products', async (req, res) => {
  try {
    const pool = database.getPool();

    // Query para obtener productos activos con información del patronista
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
        pf."filePath" as "imageUrl",
        u."firstName" as "patronistaFirstName",
        u."lastName" as "patronistaLastName",
        c.name as "categoryName"
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN product_files pf ON p.id = pf."productId" AND pf."fileType" = 'image'
      WHERE p.active = true
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
      imageUrl: product.imageUrl,
      patronista: `${product.patronistaFirstName || ''} ${product.patronistaLastName || ''}`.trim(),
      category: product.categoryName,
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
        pf."filePath" as "imageUrl",
        u."firstName" as "patronistaFirstName",
        u."lastName" as "patronistaLastName",
        c.name as "categoryName"
      FROM products p
      LEFT JOIN users u ON p."patronistaId" = u.id
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN product_files pf ON p.id = pf."productId" AND pf."fileType" = 'image'
      WHERE p.id = $1 AND p.active = true
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
      imageUrl: product.imageUrl,
      patronista: `${product.patronistaFirstName || ''} ${product.patronistaLastName || ''}`.trim(),
      category: product.categoryName,
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
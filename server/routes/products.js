const express = require('express');
const database = require('../models/database');
const { auth, requirePatronista } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los productos (público)
router.get('/', (req, res) => {
  try {
    const db = database.getDb();
    
    // Query básico para obtener productos activos
    const query = `
      SELECT 
        p.*,
        u.firstName as patronistaFirstName,
        u.lastName as patronistaLastName,
        c.name as categoryName
      FROM products p
      LEFT JOIN users u ON p.patronistaId = u.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.active = 1
      ORDER BY p.createdAt DESC
    `;

    db.all(query, (err, products) => {
      if (err) {
        console.error('Error obteniendo productos:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      res.json(products);
    });

  } catch (error) {
    console.error('Error en GET /products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener productos del patronista autenticado (debe ir antes de /:id)
router.get('/my-products', auth, requirePatronista, (req, res) => {
  try {
    const patronistaId = req.user.userId;
    const db = database.getDb();

    const query = `
      SELECT 
        p.*,
        c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.patronistaId = ?
      ORDER BY p.createdAt DESC
    `;

    db.all(query, [patronistaId], (err, products) => {
      if (err) {
        console.error('Error obteniendo mis productos:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      res.json(products);
    });

  } catch (error) {
    console.error('Error en GET /my-products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener producto por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = database.getDb();

    const query = `
      SELECT 
        p.*,
        u.firstName as patronistaFirstName,
        u.lastName as patronistaLastName,
        c.name as categoryName
      FROM products p
      LEFT JOIN users u ON p.patronistaId = u.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ? AND p.active = 1
    `;

    db.get(query, [id], (err, product) => {
      if (err) {
        console.error('Error obteniendo producto:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      res.json(product);
    });

  } catch (error) {
    console.error('Error en GET /products/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear producto (solo patronistas)
router.post('/', auth, requirePatronista, (req, res) => {
  try {
    const { title, description, categoryId, basicPrice, trainingPrice, difficulty, sizes } = req.body;
    const patronistaId = req.user.userId;

    // Validaciones
    if (!title || !basicPrice || !trainingPrice) {
      return res.status(400).json({ 
        message: 'Título, precio básico y precio con capacitación son requeridos' 
      });
    }

    if (basicPrice <= 0 || trainingPrice <= 0) {
      return res.status(400).json({ 
        message: 'Los precios deben ser mayores a 0' 
      });
    }

    const db = database.getDb();

    const query = `
      INSERT INTO products (patronistaId, title, description, categoryId, basicPrice, trainingPrice, difficulty, sizes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [patronistaId, title, description, categoryId, basicPrice, trainingPrice, difficulty, JSON.stringify(sizes)],
      function(err) {
        if (err) {
          console.error('Error creando producto:', err);
          return res.status(500).json({ message: 'Error creando producto' });
        }

        res.status(201).json({
          message: 'Producto creado exitosamente',
          productId: this.lastID
        });
      }
    );

  } catch (error) {
    console.error('Error en POST /products:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
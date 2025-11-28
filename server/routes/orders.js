const express = require('express');
const database = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Crear nuevo pedido
router.post('/', auth, (req, res) => {
  try {
    const { items } = req.body; // Array de items con productId, optionType, price
    const clienteId = req.user.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Debe incluir al menos un item en el pedido' 
      });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const db = database.getDb();

    // Crear el pedido
    db.run(
      'INSERT INTO orders (clienteId, total) VALUES (?, ?)',
      [clienteId, total],
      function(err) {
        if (err) {
          console.error('Error creando pedido:', err);
          return res.status(500).json({ message: 'Error creando pedido' });
        }

        const orderId = this.lastID;

        // Insertar items del pedido
        const itemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO order_items (orderId, productId, optionType, price, quantity) VALUES (?, ?, ?, ?, ?)',
              [orderId, item.productId, item.optionType, item.price, item.quantity || 1],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(itemPromises)
          .then(() => {
            res.status(201).json({
              message: 'Pedido creado exitosamente',
              orderId: orderId,
              total: total
            });
          })
          .catch(err => {
            console.error('Error insertando items del pedido:', err);
            res.status(500).json({ message: 'Error procesando items del pedido' });
          });
      }
    );

  } catch (error) {
    console.error('Error en POST /orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pedidos del usuario autenticado
router.get('/my-orders', auth, (req, res) => {
  try {
    const userId = req.user.userId;
    const db = database.getDb();

    const query = `
      SELECT 
        o.*,
        GROUP_CONCAT(
          json_object(
            'productId', oi.productId,
            'productTitle', p.title,
            'optionType', oi.optionType,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      LEFT JOIN products p ON oi.productId = p.id
      WHERE o.clienteId = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `;

    db.all(query, [userId], (err, orders) => {
      if (err) {
        console.error('Error obteniendo pedidos:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      res.json(orders);
    });

  } catch (error) {
    console.error('Error en GET /my-orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pedidos del patronista (pedidos que incluyen sus productos)
router.get('/patronista-orders', auth, (req, res) => {
  try {
    const patronistaId = req.user.userId;
    const db = database.getDb();

    const query = `
      SELECT DISTINCT
        o.id,
        o.clienteId,
        o.total,
        o.status,
        o.paymentMethod,
        o.createdAt,
        o.updatedAt,
        u.firstName as clientFirstName,
        u.lastName as clientLastName,
        u.email as clientEmail,
        GROUP_CONCAT(
          CASE 
            WHEN p.patronistaId = ?
            THEN json_object(
              'productId', oi.productId,
              'productTitle', p.title,
              'optionType', oi.optionType,
              'price', oi.price,
              'quantity', oi.quantity
            )
          END
        ) as items
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.orderId
      INNER JOIN products p ON oi.productId = p.id
      LEFT JOIN users u ON o.clienteId = u.id
      WHERE p.patronistaId = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `;

    db.all(query, [patronistaId, patronistaId], (err, orders) => {
      if (err) {
        console.error('Error obteniendo pedidos del patronista:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      res.json(orders);
    });

  } catch (error) {
    console.error('Error en GET /patronista-orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
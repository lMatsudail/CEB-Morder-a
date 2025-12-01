const express = require('express');
const database = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Crear nuevo pedido
router.post('/', auth, async (req, res) => {
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

    const pool = database.getPool();

    try {
      // Crear el pedido
      const orderQuery = 'INSERT INTO orders ("clienteId", total) VALUES ($1, $2) RETURNING id';
      const orderResult = await pool.query(orderQuery, [clienteId, total]);
      const orderId = orderResult.rows[0].id;

      // Insertar items del pedido
      const itemQuery = 'INSERT INTO order_items ("orderId", "productId", "optionType", price, quantity) VALUES ($1, $2, $3, $4, $5)';
      
      for (const item of items) {
        await pool.query(itemQuery, [
          orderId, 
          item.productId, 
          item.optionType, 
          item.price, 
          item.quantity || 1
        ]);
      }

      res.status(201).json({
        message: 'Pedido creado exitosamente',
        orderId: orderId,
        total: total
      });
    } catch (error) {
      console.error('Error en transacción de pedido:', error);
      res.status(500).json({ message: 'Error procesando pedido' });
    }

  } catch (error) {
    console.error('Error en POST /orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pedidos del usuario autenticado
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = database.getPool();

    const query = `
      SELECT 
        o.id,
        o."clienteId",
        o.total,
        o.status,
        o."paymentMethod",
        o."paymentId",
        o."createdAt" as createdat,
        o."updatedAt" as updatedat,
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'productTitle', p.title,
            'optionType', oi."optionType",
            'price', oi.price,
            'quantity', oi.quantity,
            'files', (
              SELECT json_agg(
                json_build_object(
                  'id', pf.id,
                  'filename', pf."fileName",
                  'filepath', pf."filePath",
                  'filetype', pf."fileType"
                )
              )
              FROM product_files pf
              WHERE pf."productId" = oi."productId" AND pf."fileType" IN ('pattern', 'document')
            )
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      LEFT JOIN products p ON oi."productId" = p.id
      WHERE o."clienteId" = $1
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error en GET /my-orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pedido específico por ID
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;
    const pool = database.getPool();

    const query = `
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'productId', oi."productId",
            'productTitle', p.title,
            'optionType', oi."optionType",
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      LEFT JOIN products p ON oi."productId" = p.id
      WHERE o.id = $1 AND o."clienteId" = $2
      GROUP BY o.id
    `;

    const result = await pool.query(query, [orderId, userId]);
    const order = result.rows[0];

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json(order);

  } catch (error) {
    console.error('Error en GET /orders/:orderId:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pedidos asociados a los productos del patronista autenticado
router.get('/patronista-orders', auth, async (req, res) => {
  try {
    const patronistaId = req.user.userId;
    const pool = database.getPool();

    const query = `
      SELECT 
        o.id,
        o.clienteid,
        o.total,
        o.status,
        o.paymentmethod,
        o.paymentid,
        o.createdat,
        o.updatedat,
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.productid,
            'productTitle', p.title,
            'optionType', oi.optiontype,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.orderid
      INNER JOIN products p ON oi.productid = p.id
      WHERE p.patronistaid = $1
      GROUP BY o.id
      ORDER BY o.createdat DESC
    `;

    const result = await pool.query(query, [patronistaId]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error en GET /orders/patronista-orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

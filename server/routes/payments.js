const express = require('express');
const database = require('../models/database');
const wompiService = require('../services/wompiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Crear orden y generar link de pago con Wompi
 * POST /api/payments/create-order
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const { items, paymentMethods } = req.body; // paymentMethods opcional: ["CARD","PSE",...]
    const userId = req.user.userId;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Debe incluir al menos un item en el pedido'
      });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const pool = database.getPool();

    try {
      // Iniciar transacción
      await pool.query('BEGIN');

      // Crear orden en estado pending
      const orderQuery = `
        INSERT INTO orders ("clienteId", total, status, "paymentMethod") 
        VALUES ($1, $2, $3, $4) 
        RETURNING id
      `;
      const orderResult = await pool.query(orderQuery, [userId, total, 'pending', 'wompi']);
      const orderId = orderResult.rows[0].id;

      // Insertar items del pedido
      const itemQuery = `
        INSERT INTO order_items ("orderId", "productId", "optionType", price, quantity) 
        VALUES ($1, $2, $3, $4, $5)
      `;

      for (const item of items) {
        await pool.query(itemQuery, [
          orderId,
          item.productId,
          item.optionType,
          item.price,
          item.quantity || 1
        ]);
      }

      // Obtener datos del usuario para Wompi
      const userQuery = 'SELECT email, "firstName", "lastName" FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [userId]);
      const user = userResult.rows[0];

      // Crear descripción para el pago
      const description = `Compra de ${items.length} molde(s) - Orden #${orderId}`;

      // Generar link de pago con Wompi
      const paymentData = {
        orderId,
        amount: total,
        currency: 'COP',
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        description,
        paymentMethods // Pasamos array si fue enviado
      };

      const paymentResult = await wompiService.createPaymentLink(paymentData);

      if (!paymentResult.success) {
        // Rollback si falla la creación del link
        await pool.query('ROLLBACK');
        return res.status(500).json({
          message: 'Error al generar link de pago',
          error: paymentResult.error
        });
      }

      // Actualizar orden con paymentId
      await pool.query(
        'UPDATE orders SET "paymentId" = $1 WHERE id = $2',
        [paymentResult.data.paymentId, orderId]
      );

      // Commit de la transacción
      await pool.query('COMMIT');

      // Respuesta exitosa
      res.status(201).json({
        message: 'Orden creada exitosamente',
        orderId,
        total,
        payment: {
          paymentUrl: paymentResult.data.paymentUrl,
          paymentId: paymentResult.data.paymentId,
          reference: paymentResult.data.reference,
          expiresAt: paymentResult.data.expiresAt
        }
      });

    } catch (error) {
      // Rollback en caso de error
      await pool.query('ROLLBACK');
      console.error('Error en transacción de pedido:', error);
      res.status(500).json({ message: 'Error procesando pedido' });
    }

  } catch (error) {
    console.error('Error en create-order:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * Verificar estado de pago
 * GET /api/payments/status/:orderId
 */
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const pool = database.getPool();

    // Verificar que la orden pertenece al usuario
    const orderQuery = `
      SELECT id, "clienteId", total, status, "paymentMethod", "paymentId", "createdAt"
      FROM orders
      WHERE id = $1 AND "clienteId" = $2
    `;
    const orderResult = await pool.query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const order = orderResult.rows[0];

    // Si tiene paymentId de Wompi, consultar estado
    if (order['paymentId']) {
      const statusResult = await wompiService.getTransactionStatus(order['paymentId']);

      if (statusResult.success) {
        // Actualizar estado de la orden si cambió
        const newStatus = wompiService.mapPaymentStatus(statusResult.data.status);

        if (newStatus !== order.status) {
          await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2',
            [newStatus, orderId]
          );
          order.status = newStatus;
        }

        return res.json({
          orderId: order.id,
          status: order.status,
          total: order.total,
          paymentStatus: statusResult.data.status,
          paymentMethod: statusResult.data.paymentMethod,
          createdAt: order['createdAt']
        });
      }
    }

    // Respuesta por defecto
    res.json({
      orderId: order.id,
      status: order.status,
      total: order.total,
      createdAt: order['createdAt']
    });

  } catch (error) {
    console.error('Error verificando estado de pago:', error);
    res.status(500).json({ message: 'Error al verificar estado de pago' });
  }
});

/**
 * Webhook de Wompi para notificaciones de pago
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const signature = req.headers['x-wompi-signature'];

    // Validar firma del webhook (en producción)
    if (process.env.NODE_ENV === 'production') {
      const isValid = wompiService.validateWebhookSignature(event, signature);
      if (!isValid) {
        console.error('Firma de webhook inválida');
        return res.status(401).json({ message: 'Firma inválida' });
      }
    }

    // Procesar evento
    const processedEvent = wompiService.processWebhookEvent(event);

    if (!processedEvent.success) {
      return res.status(400).json({ message: 'Evento inválido' });
    }

    const { transactionId, reference, status } = processedEvent.data;

    // Extraer orderId de la referencia (formato: ORDER-123-timestamp)
    const orderIdMatch = reference?.match(/ORDER-(\d+)-/);
    if (!orderIdMatch) {
      console.error('Referencia de orden inválida:', reference);
      return res.status(400).json({ message: 'Referencia inválida' });
    }

    const orderId = parseInt(orderIdMatch[1]);
    const pool = database.getPool();

    // Actualizar estado de la orden
    const newStatus = wompiService.mapPaymentStatus(status);

    await pool.query(
      'UPDATE orders SET status = $1, "paymentId" = $2 WHERE id = $3',
      [newStatus, transactionId, orderId]
    );

    console.log(`✅ Orden ${orderId} actualizada a estado: ${newStatus} (Wompi: ${status})`);

    // Wompi espera respuesta 200
    res.status(200).json({ message: 'Evento procesado exitosamente' });

  } catch (error) {
    console.error('Error procesando webhook de Wompi:', error);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
});

module.exports = router;

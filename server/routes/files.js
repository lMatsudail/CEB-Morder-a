const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const database = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/files/download/:fileId - Descargar archivo (solo si el pago está confirmado)
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.userId;
    const pool = database.getPool();

    // 1. Verificar que el archivo existe
    const fileQuery = await pool.query(
      'SELECT * FROM product_files WHERE id = $1',
      [fileId]
    );

    if (fileQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const file = fileQuery.rows[0];
    const productId = file['productId'];

    // 2. Verificar que el usuario tiene acceso al archivo
    // El usuario debe tener un pedido PAGADO que contenga este producto
    const accessQuery = await pool.query(`
      SELECT o.id, o.status
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi."orderId"
      WHERE o."clienteId" = $1 
        AND oi."productId" = $2 
        AND o.status IN ('paid', 'completed')
      LIMIT 1
    `, [userId, productId]);

    if (accessQuery.rows.length === 0) {
      return res.status(403).json({ 
        message: 'No tienes acceso a este archivo. Debes completar el pago primero.' 
      });
    }

    // 3. Enviar el archivo
    const filePath = path.join(__dirname, '..', file['filePath']);

    try {
      await fs.access(filePath);
      res.download(filePath, file['fileName'], (err) => {
        if (err) {
          console.error('Error enviando archivo:', err);
          res.status(500).json({ message: 'Error descargando archivo' });
        }
      });
    } catch (error) {
      console.error('Archivo no encontrado en el sistema:', filePath);
      res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

  } catch (error) {
    console.error('Error en GET /files/download/:fileId:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

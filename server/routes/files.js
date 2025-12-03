const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const database = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/files/image/:productId/:fileId - Servir imagen desde BD (público)
router.get('/image/:productId/:fileId', async (req, res) => {
  try {
    const { productId, fileId } = req.params;
    const pool = database.getPool();

    // Obtener el archivo desde la BD
    const fileQuery = await pool.query(
      'SELECT * FROM product_files WHERE id = $1 AND "productId" = $2',
      [fileId, productId]
    );

    if (fileQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const file = fileQuery.rows[0];

    // Si el archivo tiene datos en fileData, servir desde BD
    if (file.fileData) {
      res.setHeader('Content-Type', getMimeType(file.fileType, file.originalName));
      res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
      return res.send(file.fileData);
    }

    // Si no tiene datos pero tiene filePath (archivos antiguos), intentar desde disco
    if (file.filePath) {
      const filePath = path.join(__dirname, '..', 'uploads', file.filePath);
      try {
        await fs.access(filePath);
        res.setHeader('Content-Type', getMimeType(file.fileType, file.originalName));
        res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
        res.sendFile(filePath);
      } catch (error) {
        return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
      }
    }

    return res.status(404).json({ message: 'Archivo no tiene datos' });

  } catch (error) {
    console.error('Error en GET /files/image/:productId/:fileId:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Función auxiliar para determinar MIME type
function getMimeType(fileType, originalName) {
  if (fileType === 'image') {
    if (originalName.endsWith('.webp')) return 'image/webp';
    if (originalName.endsWith('.png')) return 'image/png';
    if (originalName.endsWith('.jpg') || originalName.endsWith('.jpeg')) return 'image/jpeg';
    if (originalName.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  }
  if (fileType === 'pattern') {
    if (originalName.endsWith('.pdf')) return 'application/pdf';
    if (originalName.endsWith('.zip')) return 'application/zip';
    if (originalName.endsWith('.rar')) return 'application/x-rar-compressed';
    return 'application/octet-stream';
  }
  return 'application/octet-stream';
}

// GET /api/files/pattern/:productId/:fileId - Servir patrón/molde desde BD (público)
router.get('/pattern/:productId/:fileId', async (req, res) => {
  try {
    const { productId, fileId } = req.params;
    const pool = database.getPool();

    // Obtener el archivo desde la BD
    const fileQuery = await pool.query(
      'SELECT * FROM product_files WHERE id = $1 AND "productId" = $2 AND "fileType" = $3',
      [fileId, productId, 'pattern']
    );

    if (fileQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Patrón no encontrado' });
    }

    const file = fileQuery.rows[0];

    // Si el archivo tiene datos en fileData, servir desde BD
    if (file.fileData) {
      res.setHeader('Content-Type', getMimeType(file.fileType, file.originalName));
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(file.fileData);
    }

    // Si no tiene datos pero tiene filePath (archivos antiguos), intentar desde disco
    if (file.filePath) {
      const filePath = path.join(__dirname, '..', 'uploads', file.filePath);
      try {
        await fs.access(filePath);
        res.setHeader('Content-Type', getMimeType(file.fileType, file.originalName));
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.download(filePath);
      } catch (error) {
        return res.status(404).json({ message: 'Patrón no encontrado en el servidor' });
      }
    }

    return res.status(404).json({ message: 'Patrón no tiene datos' });

  } catch (error) {
    console.error('Error en GET /files/pattern/:productId/:fileId:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

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
    const productId = file.productId;

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
    const filePath = path.join(__dirname, '..', file.filePath);

    try {
      await fs.access(filePath);
      res.download(filePath, file.fileName, (err) => {
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

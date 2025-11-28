const express = require('express');
const database = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Obtener perfil del usuario autenticado
router.get('/profile', auth, async (req, res) => {
  try {
    const pool = database.getPool();

    const query = `
      SELECT id, "firstName", "lastName", email, role, phone, city, "createdAt" 
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [req.user.userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error en GET /profile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, city } = req.body;
    const userId = req.user.userId;

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Nombre y apellido son requeridos' 
      });
    }

    const pool = database.getPool();

    const query = `
      UPDATE users 
      SET "firstName" = $1, "lastName" = $2, phone = $3, city = $4, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE id = $5
    `;

    const result = await pool.query(query, [firstName, lastName, phone, city, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado exitosamente' });

  } catch (error) {
    console.error('Error en PUT /profile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

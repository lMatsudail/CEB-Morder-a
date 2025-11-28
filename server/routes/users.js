const express = require('express');
const database = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Obtener perfil del usuario autenticado
router.get('/profile', auth, (req, res) => {
  try {
    const db = database.getDb();

    db.get(
      'SELECT id, firstName, lastName, email, role, phone, city, createdAt FROM users WHERE id = ?',
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error('Error obteniendo perfil:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
      }
    );

  } catch (error) {
    console.error('Error en GET /profile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario
router.put('/profile', auth, (req, res) => {
  try {
    const { firstName, lastName, phone, city } = req.body;
    const userId = req.user.userId;

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Nombre y apellido son requeridos' 
      });
    }

    const db = database.getDb();

    db.run(
      'UPDATE users SET firstName = ?, lastName = ?, phone = ?, city = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, phone, city, userId],
      function(err) {
        if (err) {
          console.error('Error actualizando perfil:', err);
          return res.status(500).json({ message: 'Error actualizando perfil' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Perfil actualizado exitosamente' });
      }
    );

  } catch (error) {
    console.error('Error en PUT /profile:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
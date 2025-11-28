const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../models/database');
const config = require('../config');

const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city } = req.body;

    // Validaciones
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // FORZAR ROL "CLIENTE" - Solo admin puede asignar otros roles
    const role = 'cliente';
    const pool = database.getPool();

    try {
      // Verificar si el usuario ya existe
      const checkQuery = 'SELECT id FROM users WHERE email = $1';
      const checkResult = await pool.query(checkQuery, [email]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Ya existe un usuario con este correo electrónico' 
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insertar usuario
      const insertQuery = `
        INSERT INTO users (firstName, lastName, email, password, role, phone, city) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const result = await pool.query(insertQuery, [
        firstName, 
        lastName, 
        email, 
        hashedPassword, 
        role, 
        phone || null, 
        city || null
      ]);

      const userId = result.rows[0].id;

      // Crear token JWT
      const token = jwt.sign(
        { 
          userId, 
          email, 
          role 
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Respuesta exitosa
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        token,
        user: {
          id: userId,
          firstName,
          lastName,
          email,
          role,
          phone,
          city
        }
      });
    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      res.status(500).json({ message: 'Error creando usuario' });
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    const pool = database.getPool();

    try {
      // Buscar usuario por email
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }

      // Crear token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Respuesta exitosa
      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          city: user.city
        }
      });
    } catch (error) {
      console.error('Error verificando credenciales:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener usuario actual (requiere autenticación)
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
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
    console.error('Error en /me:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

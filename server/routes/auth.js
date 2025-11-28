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

    const db = database.getDb();

    // Verificar si el usuario ya existe
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Error verificando usuario existente:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      if (row) {
        return res.status(400).json({ 
          message: 'Ya existe un usuario con este correo electrónico' 
        });
      }

      try {
        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        db.run(
          `INSERT INTO users (firstName, lastName, email, password, role, phone, city) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [firstName, lastName, email, hashedPassword, role, phone || null, city || null],
          function(err) {
            if (err) {
              console.error('Error creando usuario:', err);
              return res.status(500).json({ message: 'Error creando usuario' });
            }

            // Crear token JWT
            const token = jwt.sign(
              { 
                userId: this.lastID, 
                email, 
                role 
              },
              config.JWT.SECRET,
              { expiresIn: '7d' }
            );

            // Respuesta exitosa
            res.status(201).json({
              message: 'Usuario creado exitosamente',
              token,
              user: {
                id: this.lastID,
                firstName,
                lastName,
                email,
                role,
                phone,
                city
              }
            });
          }
        );
      } catch (error) {
        console.error('Error en el proceso de registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
      }
    });

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

    const db = database.getDb();

    // Buscar usuario por email
    db.get(
      'SELECT * FROM users WHERE email = ?', 
      [email], 
      async (err, user) => {
        if (err) {
          console.error('Error buscando usuario:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (!user) {
          return res.status(401).json({ 
            message: 'Credenciales inválidas' 
          });
        }

        try {
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
            config.JWT.SECRET,
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
          console.error('Error verificando contraseña:', error);
          res.status(500).json({ message: 'Error interno del servidor' });
        }
      }
    );

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener usuario actual (requiere autenticación)
router.get('/me', require('../middleware/auth').auth, (req, res) => {
  try {
    const db = database.getDb();

    db.get(
      'SELECT id, firstName, lastName, email, role, phone, city, createdAt FROM users WHERE id = ?',
      [req.user.userId],
      (err, user) => {
        if (err) {
          console.error('Error obteniendo usuario:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
      }
    );

  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
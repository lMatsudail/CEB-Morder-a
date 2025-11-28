const express = require('express');
const database = require('../models/database');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(auth, requireAdmin);

// GET /api/admin/users - Obtener todos los usuarios
router.get('/users', (req, res) => {
  try {
    const db = database.getDb();

    db.all(
      `SELECT id, firstName, lastName, email, role, phone, city, createdAt 
       FROM users 
       ORDER BY createdAt DESC`,
      [],
      (err, users) => {
        if (err) {
          console.error('Error obteniendo usuarios:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        res.json(users);
      }
    );
  } catch (error) {
    console.error('Error en GET /admin/users:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/admin/users/:id - Obtener un usuario específico
router.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = database.getDb();

    db.get(
      `SELECT id, firstName, lastName, email, role, phone, city, createdAt, updatedAt 
       FROM users 
       WHERE id = ?`,
      [id],
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
    console.error('Error en GET /admin/users/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/admin/users/:id/role - Cambiar el rol de un usuario
router.put('/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar rol
    if (!role || !['cliente', 'patronista', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Rol inválido. Debe ser: cliente, patronista o admin' 
      });
    }

    // No permitir que un admin se quite a sí mismo el rol de admin
    if (req.user.userId === parseInt(id) && role !== 'admin') {
      return res.status(400).json({ 
        message: 'No puedes quitarte tu propio rol de administrador' 
      });
    }

    const db = database.getDb();

    // Actualizar rol
    db.run(
      'UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [role, id],
      function(err) {
        if (err) {
          console.error('Error actualizando rol:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener usuario actualizado
        db.get(
          'SELECT id, firstName, lastName, email, role, phone, city, createdAt, updatedAt FROM users WHERE id = ?',
          [id],
          (err, user) => {
            if (err) {
              console.error('Error obteniendo usuario actualizado:', err);
              return res.status(500).json({ message: 'Error interno del servidor' });
            }

            res.json({
              message: 'Rol actualizado exitosamente',
              user
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error en PUT /admin/users/:id/role:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/admin/stats - Obtener estadísticas del sistema
router.get('/stats', (req, res) => {
  try {
    const db = database.getDb();

    // Contar usuarios por rol
    db.all(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role',
      [],
      (err, roleCounts) => {
        if (err) {
          console.error('Error obteniendo estadísticas de roles:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        // Contar productos totales
        db.get(
          'SELECT COUNT(*) as count FROM products',
          [],
          (err, productCount) => {
            if (err) {
              console.error('Error contando productos:', err);
              return res.status(500).json({ message: 'Error interno del servidor' });
            }

            // Contar pedidos por estado
            db.all(
              'SELECT status, COUNT(*) as count FROM orders GROUP BY status',
              [],
              (err, orderCounts) => {
                if (err) {
                  console.error('Error obteniendo estadísticas de pedidos:', err);
                  return res.status(500).json({ message: 'Error interno del servidor' });
                }

                // Calcular ingresos totales
                db.get(
                  'SELECT SUM(total) as total FROM orders WHERE status IN ("paid", "completed")',
                  [],
                  (err, revenue) => {
                    if (err) {
                      console.error('Error calculando ingresos:', err);
                      return res.status(500).json({ message: 'Error interno del servidor' });
                    }

                    res.json({
                      users: {
                        total: roleCounts.reduce((sum, r) => sum + r.count, 0),
                        byRole: roleCounts.reduce((obj, r) => {
                          obj[r.role] = r.count;
                          return obj;
                        }, {})
                      },
                      products: {
                        total: productCount.count
                      },
                      orders: {
                        total: orderCounts.reduce((sum, o) => sum + o.count, 0),
                        byStatus: orderCounts.reduce((obj, o) => {
                          obj[o.status] = o.count;
                          return obj;
                        }, {})
                      },
                      revenue: {
                        total: revenue.total || 0
                      }
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error en GET /admin/stats:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/users/:id - Eliminar un usuario (opcional, usar con precaución)
router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un admin se elimine a sí mismo
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({ 
        message: 'No puedes eliminar tu propia cuenta de administrador' 
      });
    }

    const db = database.getDb();

    // Verificar que el usuario existe
    db.get('SELECT id, role FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        console.error('Error verificando usuario:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Eliminar usuario
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error eliminando usuario:', err);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }

        res.json({
          message: 'Usuario eliminado exitosamente',
          deletedUserId: id
        });
      });
    });
  } catch (error) {
    console.error('Error en DELETE /admin/users/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

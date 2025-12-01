const express = require('express');
const database = require('../models/database');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(auth, requireAdmin);

// GET /api/admin/users - Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const pool = database.getPool();

    const result = await pool.query(`
      SELECT id, firstname, lastname, email, role, phone, city, createdat 
      FROM users 
      ORDER BY createdat DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en GET /admin/users:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/admin/users/:id - Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = database.getPool();

    const result = await pool.query(`
      SELECT id, firstname, lastname, email, role, phone, city, createdat, updatedat 
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en GET /admin/users/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/admin/users/:id/role - Cambiar el rol de un usuario
router.put('/users/:id/role', async (req, res) => {
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

    const pool = database.getPool();

    // Actualizar rol
    const result = await pool.query(
      'UPDATE users SET role = $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, firstname, lastname, email, role, phone, city, createdat, updatedat',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Rol actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error en PUT /admin/users/:id/role:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/admin/stats - Obtener estadísticas del sistema
router.get('/stats', async (req, res) => {
  try {
    const pool = database.getPool();

    // Contar usuarios por rol
    const roleCounts = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');

    // Contar productos totales
    const productCount = await pool.query('SELECT COUNT(*) as count FROM products');

    // Contar pedidos por estado
    const orderCounts = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');

    // Calcular ingresos totales
    const revenue = await pool.query('SELECT SUM(total) as total FROM orders WHERE status IN ($1, $2)', ['paid', 'completed']);

    res.json({
      users: {
        total: roleCounts.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
        byRole: roleCounts.rows.reduce((obj, r) => {
          obj[r.role] = parseInt(r.count);
          return obj;
        }, {})
      },
      products: {
        total: parseInt(productCount.rows[0].count)
      },
      orders: {
        total: orderCounts.rows.reduce((sum, o) => sum + parseInt(o.count), 0),
        byStatus: orderCounts.rows.reduce((obj, o) => {
          obj[o.status] = parseInt(o.count);
          return obj;
        }, {})
      },
      revenue: {
        total: parseFloat(revenue.rows[0].total) || 0
      }
    });

  } catch (error) {
    console.error('Error en GET /admin/stats:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/users/:id - Eliminar un usuario (opcional, usar con precaución)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un admin se elimine a sí mismo
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({ 
        message: 'No puedes eliminar tu propia cuenta de administrador' 
      });
    }

    const pool = database.getPool();

    // Verificar que el usuario existe
    const checkResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar usuario (CASCADE eliminará sus productos, pedidos, etc.)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      message: 'Usuario eliminado exitosamente',
      deletedUserId: parseInt(id)
    });

  } catch (error) {
    console.error('Error en DELETE /admin/users/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/admin/orders - Obtener todos los pedidos con detalles completos
router.get('/orders', async (req, res) => {
  try {
    const pool = database.getPool();

    const result = await pool.query(`
      SELECT 
        o.id as order_id,
        o.total,
        o.status,
        o.paymentmethod,
        o.paymentid,
        o.createdat as order_date,
        -- Cliente
        c.id as cliente_id,
        c.firstname as cliente_firstname,
        c.lastname as cliente_lastname,
        c.email as cliente_email,
        -- Items del pedido
        json_agg(
          json_build_object(
            'item_id', oi.id,
            'product_id', oi.productid,
            'product_title', p.title,
            'option_type', oi.optiontype,
            'price', oi.price,
            'quantity', oi.quantity,
            'patronista_id', p.patronistaid,
            'patronista_firstname', pat.firstname,
            'patronista_lastname', pat.lastname
          )
        ) as items
      FROM orders o
      INNER JOIN users c ON o.clienteid = c.id
      INNER JOIN order_items oi ON o.id = oi.orderid
      INNER JOIN products p ON oi.productid = p.id
      INNER JOIN users pat ON p.patronistaid = pat.id
      GROUP BY o.id, c.id, c.firstname, c.lastname, c.email
      ORDER BY o.createdat DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Error en GET /admin/orders:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

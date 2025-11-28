const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const database = require('./models/database');

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

// Inicializar base de datos
let db;
database.initialize().then(() => {
  db = database.getDb();
  console.log('📊 Base de datos conectada correctamente');
}).catch(err => {
  console.error('❌ Error conectando base de datos:', err);
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Ruta de login real
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error del servidor' });
      }
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
      }
      
      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }
      
      res.json({
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Ruta para obtener productos reales
app.get('/api/products/my-products', (req, res) => {
  // Por ahora simulamos que es José Luis (ID: 1)
  db.all('SELECT * FROM products WHERE patronistaId = 1 ORDER BY createdAt DESC', [], (err, products) => {
    if (err) {
      console.error('Error obteniendo productos:', err);
      return res.status(500).json({ success: false, message: 'Error obteniendo productos' });
    }
    
    res.json(products);
  });
});

// Ruta para catálogo público (todos los productos activos)
app.get('/api/catalog/products', (req, res) => {
  const query = `
    SELECT p.*, u.firstName, u.lastName 
    FROM products p 
    JOIN users u ON p.patronistaId = u.id 
    WHERE p.active = 1 
    ORDER BY p.createdAt DESC
  `;
  
  db.all(query, [], (err, products) => {
    if (err) {
      console.error('Error obteniendo catálogo:', err);
      return res.status(500).json({ success: false, message: 'Error obteniendo catálogo' });
    }
    
    // Agregar información del patronista a cada producto
    const catalogProducts = products.map(product => ({
      ...product,
      patronista: {
        name: `${product.firstName} ${product.lastName}`,
        id: product.patronistaId
      }
    }));
    
    res.json(catalogProducts);
  });
});

// Ruta para obtener un producto específico del catálogo
app.get('/api/catalog/products/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = `
    SELECT p.*, u.firstName, u.lastName 
    FROM products p 
    JOIN users u ON p.patronistaId = u.id 
    WHERE p.id = ? AND p.active = 1
  `;
  
  db.get(query, [productId], (err, product) => {
    if (err) {
      console.error('Error obteniendo producto:', err);
      return res.status(500).json({ success: false, message: 'Error obteniendo producto' });
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    
    // Agregar información del patronista
    const catalogProduct = {
      ...product,
      patronista: {
        name: `${product.firstName} ${product.lastName}`,
        id: product.patronistaId
      }
    };
    
    res.json(catalogProduct);
  });
});

// Ruta para verificar usuario actual
app.get('/api/auth/me', (req, res) => {
  // Simulamos que José Luis está logueado
  res.json({
    id: 1,
    firstName: 'jose luis',
    lastName: 'florez casas',
    email: 'thaurken@hotmail.com',
    role: 'patronista'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor con base de datos real ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👤 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Products endpoint: http://localhost:${PORT}/api/products/my-products`);
  console.log(`🛍️ Catalog endpoint: http://localhost:${PORT}/api/catalog/products`);
});
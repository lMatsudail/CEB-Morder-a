const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Requerido para Render
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Eventos de conexión
pool.on('error', (err) => {
  console.error('Error no esperado en pool de PostgreSQL:', err);
});

let initialized = false;

const database = {
  // Inicializar base de datos
  initialize: async () => {
    if (initialized) {
      console.log('Base de datos ya inicializada');
      return;
    }

    try {
      // Verificar conexión
      const client = await pool.connect();
      console.log('Conectado a PostgreSQL exitosamente');
      client.release();

      // Crear tablas
      await database.createTables();
      initialized = true;
      return;
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      throw error;
    }
  },

  // Crear tablas
  createTables: async () => {
    const queries = [
      // Tabla de usuarios
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK(role IN ('cliente', 'patronista', 'admin')) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de categorías
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de productos
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        patronistaId INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        categoryId INTEGER,
        basicPrice DECIMAL(10,2) NOT NULL,
        trainingPrice DECIMAL(10,2) NOT NULL,
        difficulty VARCHAR(50) CHECK(difficulty IN ('Principiante', 'Intermedio', 'Avanzado')),
        sizes TEXT,
        active BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patronistaId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
      )`,

      // Tabla de archivos de productos
      `CREATE TABLE IF NOT EXISTS product_files (
        id SERIAL PRIMARY KEY,
        productId INTEGER NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        filePath VARCHAR(500) NOT NULL,
        fileType VARCHAR(50) CHECK(fileType IN ('image', 'pattern', 'document')),
        fileSize INTEGER,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )`,

      // Tabla de pedidos
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        clienteId INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) CHECK(status IN ('pending', 'paid', 'completed', 'cancelled')) DEFAULT 'pending',
        paymentMethod VARCHAR(100),
        paymentId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clienteId) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Tabla de items de pedidos
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        optionType VARCHAR(50) CHECK(optionType IN ('basic', 'training')) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )`,

      // Tabla de capacitaciones
      `CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        orderItemId INTEGER NOT NULL,
        patronistaId INTEGER NOT NULL,
        clienteId INTEGER NOT NULL,
        scheduledDate TIMESTAMP,
        duration INTEGER DEFAULT 60,
        status VARCHAR(50) CHECK(status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
        notes TEXT,
        meetingLink VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderItemId) REFERENCES order_items(id) ON DELETE CASCADE,
        FOREIGN KEY (patronistaId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (clienteId) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    try {
      for (const query of queries) {
        await pool.query(query);
      }
      console.log('Todas las tablas creadas correctamente');
      await database.insertSampleData();
    } catch (error) {
      console.error('Error creando tablas:', error);
      throw error;
    }
  },

  // Insertar datos de ejemplo
  insertSampleData: async () => {
    try {
      const categories = [
        { name: 'Vestidos', description: 'Moldes para vestidos de todo tipo' },
        { name: 'Blusas', description: 'Blusas casuales y formales' },
        { name: 'Pantalones', description: 'Pantalones y jeans' },
        { name: 'Faldas', description: 'Faldas de diferentes estilos' },
        { name: 'Chaquetas', description: 'Chaquetas y blazers' }
      ];

      for (const category of categories) {
        await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [category.name, category.description]
        );
      }
    } catch (error) {
      console.error('Error insertando datos de ejemplo:', error);
    }
  },

  // Obtener instancia del pool
  getPool: () => pool,

  // Ejecutar query
  query: (text, params) => pool.query(text, params),

  // Cerrar conexión
  close: async () => {
    await pool.end();
  }
};

module.exports = database;

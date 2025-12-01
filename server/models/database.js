const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones a PostgreSQL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida. Configura la variable de entorno en Render.');
}

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
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK(role IN ('cliente', 'patronista', 'admin')) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de categorías
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de productos
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        "patronistaId" INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "categoryId" INTEGER,
        "basicPrice" DECIMAL(10,2) NOT NULL,
        "trainingPrice" DECIMAL(10,2) NOT NULL,
        difficulty VARCHAR(50) CHECK(difficulty IN ('Principiante', 'Intermedio', 'Avanzado')),
        sizes TEXT,
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("patronistaId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE SET NULL
      )`,

      // Tabla de archivos de productos
      `CREATE TABLE IF NOT EXISTS product_files (
        id SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL,
        "fileName" VARCHAR(255) NOT NULL,
        "originalName" VARCHAR(255) NOT NULL,
        "filePath" VARCHAR(500) NOT NULL,
        "fileType" VARCHAR(50) CHECK("fileType" IN ('image', 'pattern', 'document')),
        "fileSize" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
      )`,

      // Tabla de pedidos
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "clienteId" INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) CHECK(status IN ('pending', 'paid', 'completed', 'cancelled')) DEFAULT 'pending',
        "paymentMethod" VARCHAR(100),
        "paymentId" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("clienteId") REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Tabla de items de pedidos
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        "orderId" INTEGER NOT NULL,
        "productId" INTEGER NOT NULL,
        "optionType" VARCHAR(50) CHECK("optionType" IN ('basic', 'training')) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER DEFAULT 1,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
      )`,

      // Tabla de capacitaciones
      `CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        "orderItemId" INTEGER NOT NULL,
        "patronistaId" INTEGER NOT NULL,
        "clienteId" INTEGER NOT NULL,
        "scheduledDate" TIMESTAMP,
        duration INTEGER DEFAULT 60,
        status VARCHAR(50) CHECK(status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
        notes TEXT,
        "meetingLink" VARCHAR(500),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("orderItemId") REFERENCES order_items(id) ON DELETE CASCADE,
        FOREIGN KEY ("patronistaId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("clienteId") REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    try {
      // En desarrollo, hacer DROP de todas las tablas para recrearlas con columnas correctas
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Limpiando tablas existentes (DEVELOPMENT ONLY)...');
        await pool.query(`
          DROP TABLE IF EXISTS trainings CASCADE;
          DROP TABLE IF EXISTS order_items CASCADE;
          DROP TABLE IF EXISTS orders CASCADE;
          DROP TABLE IF EXISTS product_files CASCADE;
          DROP TABLE IF EXISTS products CASCADE;
          DROP TABLE IF EXISTS categories CASCADE;
          DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('✅ Tablas eliminadas correctamente');
      }

      for (const query of queries) {
        await pool.query(query);
      }
      console.log('Todas las tablas creadas correctamente');
      // Semillas solo en desarrollo, producción únicamente crea admin
      if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SEED === 'true') {
        await database.insertSampleData();
      } else {
        // En producción, intentar crear admin pero sin fallar si hay problemas
        await database.ensureAdminUser();
      }
    } catch (error) {
      console.error('Error creando tablas:', error);
      // NO lancar error en producción - dejar que el servidor arranque de todas formas
      if (process.env.NODE_ENV !== 'production') {
        throw error;
      } else {
        console.error('⚠️  ADVERTENCIA: El servidor arrancará pese al error en tablas/admin');
      }
    }
  },

  // Crear admin en producción; datos de ejemplo solo en desarrollo
  ensureAdminUser: async () => {
    try {
      const bcrypt = require('bcryptjs');
      const adminEmail = 'admin@ceb.com';
      
      // Primero, vamos a obtener la estructura de la tabla users para saber qué columnas tiene
      const columnsResult = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Estructura de tabla users en producción:', columnsResult.rows);
      
      // Intentar el check del admin de forma segura
      try {
        const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        if (adminCheck.rows.length === 0) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await pool.query(
            'INSERT INTO users ("firstName", "lastName", email, password, role, phone, city) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            ['Admin', 'CEB', adminEmail, hashedPassword, 'admin', '3001234567', 'Bogotá']
          );
          console.log('✅ Admin creado (producción): admin@ceb.com / admin123');
        } else {
          console.log('ℹ️  Admin ya existe en producción');
        }
      } catch (selectError) {
        console.log('⚠️  No se pudo verificar admin existente (tabla puede tener estructura diferente):', selectError.message);
      }
    } catch (error) {
      console.error('Error creando admin en producción:', error);
    }
  },

  // Insertar datos de ejemplo
  insertSampleData: async () => {
    try {
      const bcrypt = require('bcryptjs');
      
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

      // Insertar usuarios patronistas de ejemplo (solo desarrollo)
      const patronistas = [
        { firstName: 'María', lastName: 'García', email: 'maria@molderia.com', password: await bcrypt.hash('maria123', 10), role: 'patronista', phone: '1234567890', city: 'Buenos Aires' },
        { firstName: 'Carlos', lastName: 'López', email: 'carlos@molderia.com', password: await bcrypt.hash('carlos123', 10), role: 'patronista', phone: '0987654321', city: 'Madrid' }
      ];

      for (const patronista of patronistas) {
        await pool.query(
          'INSERT INTO users ("firstName", "lastName", email, password, role, phone, city) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO NOTHING',
          [patronista.firstName, patronista.lastName, patronista.email, patronista.password, patronista.role, patronista.phone, patronista.city]
        );
      }

      // Insertar productos de ejemplo
      const products = [
        { patronistaId: 1, title: 'Vestido Casual Elegante', description: 'Molde de vestido casual con corte elegante y ajustable', categoryId: 1, basicPrice: 25.00, trainingPrice: 40.00, difficulty: 'Intermedio', sizes: '["XS", "S", "M", "L", "XL"]' },
        { patronistaId: 1, title: 'Blusa Floral Moderna', description: 'Blusa con diseño floral moderno y mangas ajustables', categoryId: 2, basicPrice: 18.00, trainingPrice: 30.00, difficulty: 'Principiante', sizes: '["S", "M", "L"]' },
        { patronistaId: 2, title: 'Pantalón Slim Fit', description: 'Pantalón slim fit con bolsillos laterales y cierre moderno', categoryId: 3, basicPrice: 30.00, trainingPrice: 45.00, difficulty: 'Intermedio', sizes: '["28", "30", "32", "34", "36"]' },
        { patronistaId: 2, title: 'Falda Plisada Clásica', description: 'Falda plisada de corte clásico con cintura alta', categoryId: 4, basicPrice: 22.00, trainingPrice: 35.00, difficulty: 'Intermedio', sizes: '["XS", "S", "M", "L"]' },
        { patronistaId: 1, title: 'Chaqueta Blazer Profesional', description: 'Chaqueta blazer de corte profesional para oficina', categoryId: 5, basicPrice: 45.00, trainingPrice: 60.00, difficulty: 'Avanzado', sizes: '["S", "M", "L", "XL"]' }
      ];

      for (const product of products) {
        await pool.query(
          'INSERT INTO products ("patronistaId", title, description, "categoryId", "basicPrice", "trainingPrice", difficulty, sizes, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) ON CONFLICT DO NOTHING',
          [product.patronistaId, product.title, product.description, product.categoryId, product.basicPrice, product.trainingPrice, product.difficulty, product.sizes]
        );
      }

      console.log('Datos de ejemplo insertados correctamente');
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

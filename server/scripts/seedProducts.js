const database = require('../models/database');

async function seedProducts() {
  try {
    await database.initialize();
    const db = database.getDb();

    // Obtener el ID del patronista
    const patronista = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', ['patronista@ejemplo.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!patronista) {
      console.log('❌ Usuario patronista no encontrado');
      process.exit(1);
    }

    const patronistaId = patronista.id;

    // Obtener el ID del cliente
    const cliente = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', ['cliente@ejemplo.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const clienteId = cliente?.id;

    // Productos de ejemplo
    const productos = [
      {
        title: 'Blusa Clásica Manga Larga',
        description: 'Patrón profesional para blusa clásica con manga larga. Incluye variaciones para diferentes tipos de tela y acabados. Ideal para principiantes.',
        categoryId: 2,
        basicPrice: 20000,
        trainingPrice: 80000,
        difficulty: 'Principiante',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL'])
      },
      {
        title: 'Vestido Cóctel Elegante',
        description: 'Diseño sofisticado para vestido de cóctel. Incluye patrones para corte princesa y diferentes largos. Perfecto para eventos formales.',
        categoryId: 1,
        basicPrice: 25000,
        trainingPrice: 90000,
        difficulty: 'Intermedio',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
      },
      {
        title: 'Pantalón Formal Sastre',
        description: 'Patrón completo para pantalón formal estilo sastre. Incluye bolsillos, cremallera y pretina profesional. Con guía de gradación.',
        categoryId: 3,
        basicPrice: 22000,
        trainingPrice: 85000,
        difficulty: 'Intermedio',
        sizes: JSON.stringify(['28', '30', '32', '34', '36', '38', '40'])
      },
      {
        title: 'Falda Circular Multitalla',
        description: 'Patrón versátil para falda circular en diferentes largos. Fácil de adaptar y confeccionar. Incluye variaciones de vuelo.',
        categoryId: 4,
        basicPrice: 18000,
        trainingPrice: 75000,
        difficulty: 'Principiante',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
      },
      {
        title: 'Chaqueta Blazer Ejecutiva',
        description: 'Patrón completo para blazer ejecutivo con solapas y bolsillos. Incluye forro y entretela. Nivel avanzado con detalles profesionales.',
        categoryId: 5,
        basicPrice: 30000,
        trainingPrice: 100000,
        difficulty: 'Avanzado',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
      },
      {
        title: 'Vestido Casual Verano',
        description: 'Diseño fresco y cómodo para temporada cálida. Patrón simple con múltiples opciones de escote. Ideal para telas ligeras.',
        categoryId: 1,
        basicPrice: 20000,
        trainingPrice: 80000,
        difficulty: 'Principiante',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL'])
      },
      {
        title: 'Camisa Hombre Clásica',
        description: 'Patrón tradicional para camisa masculina con cuello y puños. Incluye variaciones de manga corta y larga. Con tabla de medidas.',
        categoryId: 2,
        basicPrice: 21000,
        trainingPrice: 82000,
        difficulty: 'Intermedio',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
      },
      {
        title: 'Falda Lápiz Profesional',
        description: 'Patrón para falda lápiz entallada. Perfecto para look ejecutivo. Incluye cremallera invisible y pretina.',
        categoryId: 4,
        basicPrice: 19000,
        trainingPrice: 78000,
        difficulty: 'Intermedio',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL'])
      },
      {
        title: 'Pantalón Deportivo Jogger',
        description: 'Patrón moderno para pantalón tipo jogger. Incluye elástico en cintura y tobillos. Ideal para telas deportivas.',
        categoryId: 3,
        basicPrice: 20000,
        trainingPrice: 80000,
        difficulty: 'Principiante',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
      },
      {
        title: 'Vestido Gala Largo',
        description: 'Patrón exclusivo para vestido de gala largo. Incluye corpiño estructurado y falda con caída elegante. Nivel experto.',
        categoryId: 1,
        basicPrice: 35000,
        trainingPrice: 110000,
        difficulty: 'Avanzado',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL'])
      },
      {
        title: 'Blusa Crop Top Moderna',
        description: 'Diseño juvenil para blusa crop top. Múltiples variaciones de escote y largo. Fácil y rápido de confeccionar.',
        categoryId: 2,
        basicPrice: 17000,
        trainingPrice: 73000,
        difficulty: 'Principiante',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L'])
      },
      {
        title: 'Chaqueta Bomber Unisex',
        description: 'Patrón trendy para chaqueta bomber. Incluye cremallera frontal y bolsillos laterales. Diseño versátil.',
        categoryId: 5,
        basicPrice: 28000,
        trainingPrice: 95000,
        difficulty: 'Intermedio',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
      }
    ];

    console.log('🔄 Insertando productos...');
    
    for (const producto of productos) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO products (patronistaId, title, description, categoryId, basicPrice, trainingPrice, difficulty, sizes, active) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [patronistaId, producto.title, producto.description, producto.categoryId, producto.basicPrice, producto.trainingPrice, producto.difficulty, producto.sizes],
          function(err) {
            if (err) reject(err);
            else {
              console.log(`✅ Producto creado: ${producto.title} (ID: ${this.lastID})`);
              resolve(this.lastID);
            }
          }
        );
      });
    }

    // Crear pedidos de ejemplo si existe el cliente
    if (clienteId) {
      console.log('\n🔄 Creando pedidos de ejemplo...');

      // Obtener algunos productos para los pedidos
      const productosParaPedidos = await new Promise((resolve, reject) => {
        db.all('SELECT id, basicPrice, trainingPrice FROM products LIMIT 5', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      // Pedido 1: Completado
      const pedido1Total = productosParaPedidos[0].basicPrice + productosParaPedidos[1].trainingPrice;
      const pedido1Id = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO orders (clienteId, total, status, paymentMethod, createdAt) 
           VALUES (?, ?, 'completed', 'Tarjeta de Crédito', datetime('now', '-15 days'))`,
          [clienteId, pedido1Total],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (orderId, productId, optionType, price, quantity) VALUES (?, ?, 'basic', ?, 1)`,
          [pedido1Id, productosParaPedidos[0].id, productosParaPedidos[0].basicPrice],
          (err) => err ? reject(err) : resolve()
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (orderId, productId, optionType, price, quantity) VALUES (?, ?, 'training', ?, 1)`,
          [pedido1Id, productosParaPedidos[1].id, productosParaPedidos[1].trainingPrice],
          (err) => err ? reject(err) : resolve()
        );
      });

      console.log(`✅ Pedido completado creado (ID: ${pedido1Id})`);

      // Pedido 2: Pagado
      const pedido2Total = productosParaPedidos[2].trainingPrice + productosParaPedidos[3].basicPrice;
      const pedido2Id = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO orders (clienteId, total, status, paymentMethod, createdAt) 
           VALUES (?, ?, 'paid', 'PSE', datetime('now', '-5 days'))`,
          [clienteId, pedido2Total],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (orderId, productId, optionType, price, quantity) VALUES (?, ?, 'training', ?, 1)`,
          [pedido2Id, productosParaPedidos[2].id, productosParaPedidos[2].trainingPrice],
          (err) => err ? reject(err) : resolve()
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (orderId, productId, optionType, price, quantity) VALUES (?, ?, 'basic', ?, 1)`,
          [pedido2Id, productosParaPedidos[3].id, productosParaPedidos[3].basicPrice],
          (err) => err ? reject(err) : resolve()
        );
      });

      console.log(`✅ Pedido pagado creado (ID: ${pedido2Id})`);

      // Pedido 3: Pendiente
      const pedido3Total = productosParaPedidos[4].basicPrice;
      const pedido3Id = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO orders (clienteId, total, status, paymentMethod, createdAt) 
           VALUES (?, ?, 'pending', NULL, datetime('now', '-1 days'))`,
          [clienteId, pedido3Total],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (orderId, productId, optionType, price, quantity) VALUES (?, ?, 'basic', ?, 1)`,
          [pedido3Id, productosParaPedidos[4].id, productosParaPedidos[4].basicPrice],
          (err) => err ? reject(err) : resolve()
        );
      });

      console.log(`✅ Pedido pendiente creado (ID: ${pedido3Id})`);
    }

    console.log('\n✅ Base de datos poblada exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`- ${productos.length} productos creados`);
    console.log(`- 3 pedidos de ejemplo creados`);
    console.log(`\n🎯 Inicia sesión con:`);
    console.log(`Patronista: patronista@ejemplo.com / 123456`);
    console.log(`Cliente: cliente@ejemplo.com / 123456`);
    
    database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedProducts();

const database = require('../models/database');

async function verificarDatos() {
  try {
    await database.initialize();
    const db = database.getDb();

    console.log('\n📋 Verificando datos en la base de datos...\n');

    // Verificar usuarios
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, firstName, lastName, role FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('👥 Usuarios:');
    users.forEach(u => console.log(`  - ID ${u.id}: ${u.firstName} ${u.lastName} (${u.role})`));

    // Verificar productos
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT id, title, patronistaId FROM products LIMIT 5', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('\n📦 Productos (primeros 5):');
    products.forEach(p => console.log(`  - ID ${p.id}: ${p.title} (Patronista ID: ${p.patronistaId})`));

    // Verificar pedidos
    const orders = await new Promise((resolve, reject) => {
      db.all('SELECT id, clienteId, total, status FROM orders', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('\n🛒 Pedidos:');
    orders.forEach(o => console.log(`  - ID ${o.id}: Cliente ${o.clienteId}, Total $${o.total}, Estado: ${o.status}`));

    // Verificar items de pedidos
    const orderItems = await new Promise((resolve, reject) => {
      db.all('SELECT oi.*, p.title, p.patronistaId FROM order_items oi LEFT JOIN products p ON oi.productId = p.id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('\n📝 Items de pedidos:');
    orderItems.forEach(item => console.log(`  - Pedido ${item.orderId}: ${item.title} (Patronista: ${item.patronistaId})`));

    database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarDatos();

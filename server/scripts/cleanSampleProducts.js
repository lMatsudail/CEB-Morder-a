/**
 * Script para limpiar todos los productos/moldes de ejemplo
 * y dejar la base de datos lista para alimentar con datos reales
 */

const database = require('../models/database');

async function cleanSampleProducts() {
  const pool = database.getPool();

  try {
    console.log('🧹 Iniciando limpieza de moldes de ejemplo...\n');

    // 1. Contar productos actuales
    const countResult = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(countResult.rows[0].count);
    console.log(`📊 Productos actuales en la base de datos: ${totalProducts}`);

    if (totalProducts === 0) {
      console.log('✅ No hay productos para eliminar. La base de datos ya está limpia.');
      process.exit(0);
    }

    // 2. Obtener información detallada antes de eliminar
    const productsInfo = await pool.query(`
      SELECT 
        p.id,
        p.title,
        u.firstname || ' ' || u.lastname as patronista,
        (SELECT COUNT(*) FROM product_files WHERE productid = p.id AND filetype = 'image') as images_count,
        (SELECT COUNT(*) FROM product_files WHERE productid = p.id AND filetype = 'pattern') as files_count,
        (SELECT COUNT(*) FROM order_items WHERE productid = p.id) as sales_count
      FROM products p
      LEFT JOIN users u ON p.patronistaid = u.id
      ORDER BY p.id
    `);

    console.log('\n📋 Productos a eliminar:');
    console.log('─'.repeat(80));
    productsInfo.rows.forEach(p => {
      console.log(`ID ${p.id}: ${p.title}`);
      console.log(`   Patronista: ${p.patronista}`);
      console.log(`   Imágenes: ${p.images_count} | Archivos: ${p.files_count} | Ventas: ${p.sales_count}`);
      console.log('─'.repeat(80));
    });

    // 3. Eliminar items de órdenes relacionados (si existen)
    console.log('\n🗑️  Eliminando items de órdenes relacionados...');
    const deletedOrderItems = await pool.query('DELETE FROM order_items WHERE productid IN (SELECT id FROM products)');
    console.log(`   ✓ ${deletedOrderItems.rowCount} items de órdenes eliminados`);

    // 4. Eliminar todos los archivos de productos (imágenes y patrones)
    console.log('\n🗑️  Eliminando archivos de moldes (imágenes y patrones)...');
    const deletedFiles = await pool.query('DELETE FROM product_files WHERE productid IN (SELECT id FROM products)');
    console.log(`   ✓ ${deletedFiles.rowCount} archivos eliminados`);

    // 5. Eliminar productos
    console.log('\n🗑️  Eliminando productos/moldes...');
    const deletedProducts = await pool.query('DELETE FROM products');
    console.log(`   ✓ ${deletedProducts.rowCount} productos eliminados`);

    // 6. Reiniciar secuencia de IDs (opcional)
    console.log('\n🔄 Reiniciando secuencia de IDs...');
    await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
    console.log('   ✓ Secuencia reiniciada en 1');

    // 7. Verificar limpieza
    const verifyCount = await pool.query('SELECT COUNT(*) FROM products');
    const remainingProducts = parseInt(verifyCount.rows[0].count);

    console.log('\n✅ Limpieza completada exitosamente!');
    console.log(`📊 Productos restantes: ${remainingProducts}`);
    console.log('\n🎯 La base de datos está lista para alimentar con moldes reales.');
    console.log('💡 Los próximos moldes que se creen comenzarán con ID #1\n');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    throw error;
  }
}

// Ejecutar script
cleanSampleProducts()
  .then(() => {
    console.log('🏁 Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

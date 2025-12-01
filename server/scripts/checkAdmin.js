const database = require('../models/database');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Verificando usuarios administradores...\n');
    
    const pool = database.getPool();
    
    // Buscar usuarios admin
    const adminQuery = 'SELECT id, firstname, lastname, email, role FROM users WHERE role = $1';
    const result = await pool.query(adminQuery, ['admin']);
    
    if (result.rows.length > 0) {
      console.log('✅ Se encontraron los siguientes administradores:\n');
      result.rows.forEach((admin, index) => {
        console.log(`${index + 1}. ID: ${admin.id}`);
        console.log(`   Nombre: ${admin.firstname} ${admin.lastname}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Rol: ${admin.role}\n`);
      });
    } else {
      console.log('⚠️  No se encontraron usuarios administradores.\n');
      console.log('📝 Creando usuario administrador por defecto...\n');
      
      // Crear admin por defecto
      const adminData = {
        firstName: 'Admin',
        lastName: 'CEB',
        email: 'admin@ceb.com',
        password: 'admin123', // Cambiar después del primer login
        role: 'admin',
        phone: '3001234567',
        city: 'Bogotá'
      };
      
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const insertQuery = `
        INSERT INTO users (firstname, lastname, email, password, role, phone, city) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, firstname, lastname, email, role
      `;
      
      const insertResult = await pool.query(insertQuery, [
        adminData.firstName,
        adminData.lastName,
        adminData.email,
        hashedPassword,
        adminData.role,
        adminData.phone,
        adminData.city
      ]);
      
      const newAdmin = insertResult.rows[0];
      
      console.log('✅ Usuario administrador creado exitosamente:\n');
      console.log(`   ID: ${newAdmin.id}`);
      console.log(`   Nombre: ${newAdmin.firstname} ${newAdmin.lastname}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Contraseña temporal: ${adminData.password}`);
      console.log(`   Rol: ${newAdmin.role}\n`);
      console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');
    }
    
    // Mostrar estadísticas generales
    console.log('📊 Estadísticas de usuarios:\n');
    const statsQuery = 'SELECT role, COUNT(*) as count FROM users GROUP BY role';
    const statsResult = await pool.query(statsQuery);
    
    statsResult.rows.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count} usuario(s)`);
    });
    
    console.log('\n✅ Verificación completada.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

// Ejecutar
checkAndCreateAdmin();

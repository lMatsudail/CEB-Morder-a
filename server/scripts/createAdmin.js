const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function createAdmin() {
  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  // Datos del admin
  const adminData = {
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@ceb.com',
    password: 'admin123', // Cambiar en producción
    role: 'admin',
    phone: null,
    city: null
  };

  try {
    // Verificar si ya existe un admin
    db.get('SELECT id FROM users WHERE email = ?', [adminData.email], async (err, row) => {
      if (err) {
        console.error('Error verificando admin existente:', err);
        process.exit(1);
      }

      if (row) {
        console.log('✅ El usuario admin ya existe (ID:', row.id, ')');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password: admin123');
        process.exit(0);
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Crear admin
      db.run(
        `INSERT INTO users (firstName, lastName, email, password, role, phone, city) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminData.firstName,
          adminData.lastName,
          adminData.email,
          hashedPassword,
          adminData.role,
          adminData.phone,
          adminData.city
        ],
        function(err) {
          if (err) {
            console.error('❌ Error creando admin:', err);
            process.exit(1);
          }

          console.log('\n✅ Usuario ADMIN creado exitosamente');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📧 Email:', adminData.email);
          console.log('🔑 Password:', adminData.password);
          console.log('🆔 ID:', this.lastID);
          console.log('👤 Rol: admin');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log('⚠️  IMPORTANTE: Cambia la contraseña en producción\n');
          
          db.close();
          process.exit(0);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    if (db) db.close();
    process.exit(1);
  }
}

// Ejecutar
console.log('Creando usuario administrador...\n');
createAdmin();

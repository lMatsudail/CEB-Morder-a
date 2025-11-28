const bcrypt = require('bcryptjs');
const database = require('../models/database');

async function seedUsers() {
  try {
    await database.initialize();
    const db = database.getDb();

    // Usuarios de prueba
    const users = [
      {
        firstName: 'María',
        lastName: 'García',
        email: 'patronista@ejemplo.com',
        password: '123456',
        role: 'patronista',
        phone: '+57 300 123 4567',
        city: 'Bogotá'
      },
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'cliente@ejemplo.com',
        password: '123456',
        role: 'cliente',
        phone: '+57 301 234 5678',
        city: 'Medellín'
      }
    ];

    for (const user of users) {
      // Verificar si el usuario ya existe
      const existingUser = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existingUser) {
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insertar usuario
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO users (firstName, lastName, email, password, role, phone, city) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.firstName, user.lastName, user.email, hashedPassword, user.role, user.phone, user.city],
            function(err) {
              if (err) reject(err);
              else {
                console.log(`✅ Usuario ${user.email} creado con ID: ${this.lastID}`);
                resolve();
              }
            }
          );
        });
      } else {
        console.log(`ℹ️  Usuario ${user.email} ya existe`);
      }
    }

    console.log('\n✅ Proceso completado');
    console.log('\n📋 Credenciales de prueba:');
    console.log('Patronista: patronista@ejemplo.com / 123456');
    console.log('Cliente: cliente@ejemplo.com / 123456');
    
    database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedUsers();

// AVISO: Este script usaba SQLite y no debe ejecutarse en producción.
// Usa scripts/checkAdmin.js (PostgreSQL) para crear/verificar el admin en Render.
// Este stub no usa dependencias

async function createAdmin() {
  console.error('❌ Este script está obsoleto (SQLite). Usa scripts/checkAdmin.js para PostgreSQL.');
  process.exit(1);

  // Sin implementación: solo aviso

  try {
    // Verificar si ya existe un admin
    // Obsoleto: salida inmediata.
    process.exit(1);
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

// Ejecutar
console.log('Creando usuario administrador...\n');
createAdmin();

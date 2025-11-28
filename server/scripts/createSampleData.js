const database = require('../models/database');
const bcrypt = require('bcryptjs');

async function createSampleData() {
  try {
    await database.initialize();
    const db = database.getDb();

    // Crear un patronista de ejemplo si no existe
    const patronistaExists = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', ['patronista@ejemplo.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    let patronistaId;
    if (!patronistaExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      patronistaId = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (firstName, lastName, email, password, role, phone, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['María', 'García', 'patronista@ejemplo.com', hashedPassword, 'patronista', '+57 300 123 4567', 'Bogotá'],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    } else {
      patronistaId = patronistaExists.id;
    }

    // Datos ficticios de moldes
    const moldesFicticios = [
      {
        title: "Vestido Elegante Nocturno",
        description: "Hermoso vestido largo ideal para eventos especiales. Incluye técnicas de drapeado y ajuste perfecto al cuerpo.",
        garmentType: "Vestido",
        sizes: JSON.stringify(["S", "M", "L", "XL"]),
        measurements: JSON.stringify({ bust: "86", waist: "66", hip: "92", length: "140" }),
        difficulty: "Intermedio",
        basePrice: 25000,
        withTrainingPrice: 85000,
        includesTraining: true,
        trainingDuration: "3 horas",
        trainingDescription: "Aprende técnicas de drapeado y ajustes para diferentes tipos de cuerpo",
        tags: "elegante, nocturno, fiesta",
        status: "published"
      },
      {
        title: "Blusa Casual Manga Larga",
        description: "Blusa versátil perfecta para el día a día. Patrón básico con variaciones de manga y escote.",
        garmentType: "Blusa",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
        measurements: JSON.stringify({ bust: "88", waist: "70", hip: "94", length: "65" }),
        difficulty: "Principiante",
        basePrice: 18000,
        withTrainingPrice: 70000,
        includesTraining: true,
        trainingDuration: "2 horas",
        trainingDescription: "Fundamentos de construcción de blusas y técnicas de acabado",
        tags: "casual, básico, versátil",
        status: "published"
      },
      {
        title: "Pantalón Clásico de Oficina",
        description: "Pantalón de corte clásico ideal para ambiente laboral. Incluye técnicas de confección profesional.",
        garmentType: "Pantalón",
        sizes: JSON.stringify(["6", "8", "10", "12", "14", "16"]),
        measurements: JSON.stringify({ bust: "0", waist: "68", hip: "96", length: "105" }),
        difficulty: "Intermedio",
        basePrice: 22000,
        withTrainingPrice: 80000,
        includesTraining: true,
        trainingDuration: "2.5 horas",
        trainingDescription: "Técnicas de confección de pantalones y ajustes de tiro",
        tags: "oficina, clásico, profesional",
        status: "published"
      },
      {
        title: "Falda Plisada Midi",
        description: "Falda midi con pliegues elegantes. Perfecto para ocasiones semi-formales.",
        garmentType: "Falda",
        sizes: JSON.stringify(["S", "M", "L", "XL"]),
        measurements: JSON.stringify({ bust: "0", waist: "64", hip: "90", length: "75" }),
        difficulty: "Avanzado",
        basePrice: 20000,
        withTrainingPrice: 75000,
        includesTraining: true,
        trainingDuration: "2 horas",
        trainingDescription: "Técnicas de plisado y construcción de faldas estructuradas",
        tags: "plisada, midi, elegante",
        status: "published"
      },
      {
        title: "Chaqueta Blazer Femenino",
        description: "Blazer clásico femenino con técnicas de sastrería. Ideal para completar looks profesionales.",
        garmentType: "Chaqueta",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        measurements: JSON.stringify({ bust: "92", waist: "72", hip: "98", length: "70" }),
        difficulty: "Avanzado",
        basePrice: 30000,
        withTrainingPrice: 95000,
        includesTraining: true,
        trainingDuration: "4 horas",
        trainingDescription: "Técnicas de sastrería, construcción de solapas y acabados profesionales",
        tags: "blazer, sastrería, profesional",
        status: "published"
      },
      {
        title: "Vestido Camisero Casual",
        description: "Vestido estilo camisero cómodo y versátil. Perfecto para looks casuales y frescos.",
        garmentType: "Vestido",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
        measurements: JSON.stringify({ bust: "84", waist: "68", hip: "90", length: "110" }),
        difficulty: "Principiante",
        basePrice: 19000,
        withTrainingPrice: 72000,
        includesTraining: true,
        trainingDuration: "2.5 horas",
        trainingDescription: "Fundamentos del vestido camisero y técnicas de botones",
        tags: "camisero, casual, cómodo",
        status: "published"
      },
      {
        title: "Blusa Campesina Romántica",
        description: "Blusa de estilo romántico con detalles bordados y mangas voluminosas.",
        garmentType: "Blusa",
        sizes: JSON.stringify(["S", "M", "L", "XL"]),
        measurements: JSON.stringify({ bust: "86", waist: "free", hip: "free", length: "60" }),
        difficulty: "Intermedio",
        basePrice: 21000,
        withTrainingPrice: 78000,
        includesTraining: true,
        trainingDuration: "3 horas",
        trainingDescription: "Técnicas de mangas voluminosas y acabados románticos",
        tags: "romántico, campesina, bordado",
        status: "published"
      },
      {
        title: "Pantalón Wide Leg Moderno",
        description: "Pantalón de pierna ancha siguiendo las tendencias actuales. Cómodo y elegante.",
        garmentType: "Pantalón",
        sizes: JSON.stringify(["8", "10", "12", "14", "16", "18"]),
        measurements: JSON.stringify({ bust: "0", waist: "70", hip: "98", length: "108" }),
        difficulty: "Intermedio",
        basePrice: 23000,
        withTrainingPrice: 82000,
        includesTraining: true,
        trainingDuration: "2.5 horas",
        trainingDescription: "Construcción de pantalones wide leg y técnicas de caída",
        tags: "wide leg, moderno, tendencia",
        status: "published"
      },
      {
        title: "Falda Circular Bohemia",
        description: "Falda circular fluida perfecta para looks bohemios y casuales. Fácil de confeccionar.",
        garmentType: "Falda",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
        measurements: JSON.stringify({ bust: "0", waist: "66", hip: "free", length: "85" }),
        difficulty: "Principiante",
        basePrice: 17000,
        withTrainingPrice: 68000,
        includesTraining: true,
        trainingDuration: "1.5 horas",
        trainingDescription: "Fundamentos de faldas circulares y técnicas de ruedo",
        tags: "circular, bohemia, fluida",
        status: "published"
      },
      {
        title: "Top Corto Deportivo",
        description: "Top ajustado ideal para actividades deportivas. Incluye técnicas para telas elásticas.",
        garmentType: "Top",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
        measurements: JSON.stringify({ bust: "82", waist: "64", hip: "86", length: "45" }),
        difficulty: "Principiante",
        basePrice: 15000,
        withTrainingPrice: 65000,
        includesTraining: true,
        trainingDuration: "2 horas",
        trainingDescription: "Trabajo con telas elásticas y técnicas de confección deportiva",
        tags: "deportivo, elástico, ajustado",
        status: "published"
      },
      {
        title: "Kimono Largo Elegante",
        description: "Kimono largo con caída elegante. Perfecto como complemento para múltiples outfits.",
        garmentType: "Kimono",
        sizes: JSON.stringify(["Única"]),
        measurements: JSON.stringify({ bust: "free", waist: "free", hip: "free", length: "120" }),
        difficulty: "Principiante",
        basePrice: 16000,
        withTrainingPrice: 66000,
        includesTraining: true,
        trainingDuration: "2 horas",
        trainingDescription: "Técnicas de kimono y trabajos con telas fluidas",
        tags: "kimono, elegante, versátil",
        status: "published"
      },
      {
        title: "Mono Enterizo Formal",
        description: "Mono elegante para ocasiones especiales. Combina la comodidad de un pantalón con la elegancia de un vestido.",
        garmentType: "Mono",
        sizes: JSON.stringify(["S", "M", "L", "XL"]),
        measurements: JSON.stringify({ bust: "88", waist: "66", hip: "94", length: "145" }),
        difficulty: "Avanzado",
        basePrice: 28000,
        withTrainingPrice: 90000,
        includesTraining: true,
        trainingDuration: "3.5 horas",
        trainingDescription: "Construcción de monos, ajustes de tiro y técnicas avanzadas",
        tags: "mono, enterizo, formal",
        status: "published"
      }
    ];

    // Insertar productos
    for (const molde of moldesFicticios) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO products (
            patronistaId, title, description, 
            basicPrice, trainingPrice, difficulty,
            sizes, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          patronistaId,
          molde.title,
          molde.description,
          molde.basePrice,
          molde.withTrainingPrice,
          molde.difficulty,
          molde.sizes,
          1
        ], function(err) {
          if (err) {
            console.error('Error insertando producto:', err);
            reject(err);
          } else {
            console.log(`✅ Creado: ${molde.title}`);
            resolve(this.lastID);
          }
        });
      });
    }

    console.log('\n🎉 ¡Datos ficticios creados exitosamente!');
    console.log('📊 Total de moldes: 12');
    console.log('👤 Patronista de ejemplo: patronista@ejemplo.com (contraseña: 123456)');
    
    database.close();
  } catch (error) {
    console.error('❌ Error creando datos ficticios:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSampleData();
}

module.exports = { createSampleData };
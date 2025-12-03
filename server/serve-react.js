/**
 * Middleware para servir React build
 * Debe estar ANTES de las rutas /api
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

function setupReactServing(app) {
  // Ruta al build
  const buildPath = path.resolve(__dirname, '..', 'build');
  
  console.log(`🔧 Configurando React serving desde: ${buildPath}`);
  console.log(`🔧 ¿Existe carpeta build? ${fs.existsSync(buildPath)}`);
  
  if (fs.existsSync(buildPath)) {
    console.log(`🔧 ¿Existe index.html? ${fs.existsSync(path.join(buildPath, 'index.html'))}`);
  }
  
  // Servir archivos estáticos (CSS, JS, imágenes)
  app.use(express.static(buildPath, {
    index: false, // No servir index.html automáticamente
    maxAge: '1h'
  }));
  
  // Ruta catch-all para React Router
  // IMPORTANTE: Esto debe estar DESPUÉS de express.static para archivos reales
  // pero ANTES de las rutas /api
  app.get(/^\/(?!api\/).*/, (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    
    console.log(`📄 GET ${req.path} -> Sirviendo index.html`);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`❌ Error sirviendo index.html:`, err.message);
          res.status(500).json({ error: 'Error sirviendo index.html' });
        }
      });
    } else {
      console.error(`❌ index.html no encontrado en: ${indexPath}`);
      res.status(404).json({ 
        error: 'React build no disponible',
        path: indexPath,
        exists: fs.existsSync(buildPath)
      });
    }
  });
}

module.exports = setupReactServing;

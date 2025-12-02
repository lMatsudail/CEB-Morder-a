const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1h',
  etag: false
}));

// SPA routing - Servir index.html para todas las rutas
app.get('*', (req, res) => {
  // No servir archivos estáticos (esos van arriba)
  // Solo servir index.html para rutas que no existen
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend SPA server running on port ${PORT}`);
});

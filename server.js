const express = require('express');
const path = require('path');
const app = express();

// Configurar el puerto
const port = process.env.PORT || 3000;

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos desde la carpeta dist
const distPath = path.join(__dirname, 'dist/coreui-free-angular-admin-template');
app.use(express.static(distPath));

// Middleware para headers de seguridad básicos
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Capturar todas las rutas y devolver el archivo index.html
// Esto permite que Angular maneje el routing del lado del cliente
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Frontend server running on port ${port}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Access the app at: http://localhost:${port}`);
});

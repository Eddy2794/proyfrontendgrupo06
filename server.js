const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist/coreui-free-angular-admin-template')));

// Capturar todas las rutas y devolver el archivo index.html
// Esto permite que Angular maneje el routing del lado del cliente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/coreui-free-angular-admin-template/index.html'));
});

// Configurar el puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});

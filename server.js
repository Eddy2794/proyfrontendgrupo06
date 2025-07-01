const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configurar el puerto
const port = process.env.PORT || 3000;

// Ruta a los archivos estáticos
const distPath = path.join(__dirname, 'dist/coreui-free-angular-admin-template');
const indexPath = path.join(distPath, 'index.html');

// MIME types básicos
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Headers de seguridad básicos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  const parsedUrl = url.parse(req.url);
  let pathName = parsedUrl.pathname;
  
  // Si es root, servir index.html
  if (pathName === '/') {
    pathName = '/index.html';
  }
  
  const filePath = path.join(distPath, pathName);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si el archivo no existe, servir index.html para Angular routing
      console.log(`File not found: ${filePath}, serving index.html`);
      serveIndexHtml(res);
    } else {
      // Servir el archivo solicitado
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error('Error reading file:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': mimeType });
          res.end(content);
        }
      });
    }
  });
});

function serveIndexHtml(res) {
  fs.readFile(indexPath, (err, content) => {
    if (err) {
      console.error('Error reading index.html:', err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Page Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
}

server.listen(port, () => {
  console.log(`🚀 Frontend server running on port ${port}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Access the app at: http://localhost:${port}`);
  
  // Verificar que existe el directorio dist
  fs.access(distPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`❌ Error: dist directory not found at ${distPath}`);
    } else {
      console.log(`✅ Found dist directory at ${distPath}`);
    }
  });
  
  // Verificar que existe index.html
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`❌ Error: index.html not found at ${indexPath}`);
    } else {
      console.log(`✅ Found index.html at ${indexPath}`);
    }
  });
});

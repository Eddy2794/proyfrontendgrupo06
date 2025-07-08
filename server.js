const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configurar el puerto
const port = process.env.PORT || 3000;

// Buscar la ruta correcta a los archivos estáticos
// Angular 17+ con @angular/build:application puede generar archivos en diferentes ubicaciones
const possibleDistPaths = [
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/browser'),
  path.join(__dirname, 'dist/coreui-free-angular-admin-template'),
  path.join(__dirname, 'dist/browser'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'build'),
  __dirname
];

let distPath = '';
let indexPath = '';

// Encontrar la ruta correcta
for (const testPath of possibleDistPaths) {
  const testIndexPath = path.join(testPath, 'index.html');
  if (fs.existsSync(testIndexPath)) {
    distPath = testPath;
    indexPath = testIndexPath;
    console.log(`✅ Found dist directory at: ${distPath}`);
    console.log(`✅ Found index.html at: ${indexPath}`);
    break;
  }
}

if (!distPath) {
  console.error('❌ Could not find dist directory or index.html in any of these locations:');
  possibleDistPaths.forEach(p => {
    console.error(`   - ${p}/index.html`);
    // Verificar si el directorio existe
    if (fs.existsSync(p)) {
      console.error(`     📁 Directory exists, listing contents:`);
      try {
        const contents = fs.readdirSync(p);
        contents.forEach(item => {
          const itemPath = path.join(p, item);
          const isDir = fs.statSync(itemPath).isDirectory();
          console.error(`       ${isDir ? '📁' : '📄'} ${item}`);
        });
      } catch (err) {
        console.error(`     ❌ Error reading directory: ${err.message}`);
      }
    } else {
      console.error(`     ❌ Directory does not exist`);
    }
  });
  
  // Listar contenido del directorio actual para debug
  console.log('📁 Current directory contents:');
  try {
    const currentDirContents = fs.readdirSync(__dirname);
    currentDirContents.forEach(item => {
      const itemPath = path.join(__dirname, item);
      const isDir = fs.statSync(itemPath).isDirectory();
      console.log(`  ${isDir ? '📁' : '📄'} ${item}`);
      
      if (isDir && (item === 'dist' || item === 'build')) {
        try {
          const subContents = fs.readdirSync(itemPath);
          console.log(`    📁 ${item}/ contents:`);
          subContents.forEach(subItem => {
            const subItemPath = path.join(itemPath, subItem);
            const isSubDir = fs.statSync(subItemPath).isDirectory();
            console.log(`      ${isSubDir ? '📁' : '📄'} ${subItem}`);
            
            // Si es un subdirectorio, también listar su contenido
            if (isSubDir) {
              try {
                const subSubContents = fs.readdirSync(subItemPath);
                subSubContents.forEach(subSubItem => {
                  console.log(`        📄 ${subSubItem}`);
                });
              } catch (err) {
                console.log(`        ❌ Error reading subdirectory: ${err.message}`);
              }
            }
          });
        } catch (err) {
          console.log(`    ❌ Error reading subdirectory: ${err.message}`);
        }
      }
    });
  } catch (err) {
    console.error('Error listing directory contents:', err);
  }
  
  console.error('❌ Creating fallback index.html for debugging...');
  const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Build Error</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .error { color: red; }
    .info { color: blue; }
  </style>
</head>
<body>
  <h1 class="error">Build Error</h1>
  <p>The Angular application was not built correctly.</p>
  <p class="info">Expected locations for index.html:</p>
  <ul>
    ${possibleDistPaths.map(p => `<li>${p}/index.html</li>`).join('')}
  </ul>
  <p class="info">Current directory: ${__dirname}</p>
  <p class="info">Please check the build process and ensure Angular CLI is installed.</p>
</body>
</html>`;
  
  const fallbackPath = path.join(__dirname, 'fallback.html');
  fs.writeFileSync(fallbackPath, fallbackHtml);
  distPath = __dirname;
  indexPath = fallbackPath;
  console.log('✅ Fallback HTML created');
}

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
  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  console.log(`${timestamp} - ${req.method} ${req.url} - ${userAgent.substring(0, 50)}...`);
  
  // Headers de seguridad básicos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS headers for development/production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  const parsedUrl = url.parse(req.url);
  let pathName = parsedUrl.pathname;
  
  // Si es root, servir index.html
  if (pathName === '/') {
    pathName = '/index.html';
  }
  
  // Manejar favicon.ico específicamente
  if (pathName === '/favicon.ico') {
    // Buscar favicon en diferentes ubicaciones
    const faviconPaths = [
      path.join(distPath, 'favicon.ico'),
      path.join(distPath, 'assets', 'favicon.ico'),
      path.join(__dirname, 'src', 'assets', 'favicon.ico'),
      path.join(__dirname, 'public', 'favicon.ico'),
      path.join(__dirname, 'favicon.ico')
    ];
    
    for (const faviconPath of faviconPaths) {
      if (fs.existsSync(faviconPath)) {
        return fs.readFile(faviconPath, (err, content) => {
          if (err) {
            console.error('Error reading favicon:', err);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Favicon not found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'image/x-icon',
              'Cache-Control': 'public, max-age=86400' // Cache por 1 día
            });
            res.end(content);
          }
        });
      }
    }
    
    // Si no se encuentra favicon, servir un favicon por defecto
    console.log('Favicon not found, serving default');
    res.writeHead(200, { 
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400'
    });
    // Favicon básico de 16x16 transparente
    const defaultFavicon = Buffer.from([
      0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x04, 0x00, 0x28, 0x01,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00,
      0x00, 0x00, 0x01, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    res.end(defaultFavicon);
    return;
  }
  
  const filePath = path.join(distPath, pathName);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si es un archivo de API (empieza con /api), devolver 404
      if (pathName.startsWith('/api/')) {
        console.log(`API endpoint not found: ${pathName}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
        return;
      }
      
      // Si el archivo no existe, servir index.html para Angular routing
      console.log(`File not found: ${filePath}, serving index.html for Angular routing`);
      serveIndexHtml(res);
    } else {
      // Servir el archivo solicitado
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error('Error reading file:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          // Añadir headers de cache para archivos estáticos
          const cacheHeaders = {};
          if (ext === '.js' || ext === '.css') {
            cacheHeaders['Cache-Control'] = 'public, max-age=31536000'; // 1 año
          } else if (ext === '.html') {
            cacheHeaders['Cache-Control'] = 'public, max-age=0'; // No cache para HTML
          } else {
            cacheHeaders['Cache-Control'] = 'public, max-age=86400'; // 1 día
          }
          
          res.writeHead(200, { 
            'Content-Type': mimeType,
            ...cacheHeaders
          });
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
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Server Error</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
    .error { color: red; }
    .container { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="error">Server Error</h1>
    <p>Could not load the application. Please try again later.</p>
    <p>Error: ${err.message}</p>
  </div>
</body>
</html>`);
    } else {
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
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

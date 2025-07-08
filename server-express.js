const express = require('express');
const path = require('path');
const fs = require('fs');

// Configurar el puerto
const port = process.env.PORT || 3000;

// Crear app Express
const app = express();

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.headers['user-agent'] || 'Unknown';
  console.log(`${timestamp} - ${req.method} ${req.url} - ${userAgent.substring(0, 50)}...`);
  next();
});

// Buscar la ruta correcta a los archivos estáticos
const possibleDistPaths = [
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/browser'),
  path.join(__dirname, 'dist/coreui-free-angular-admin-template'),
  path.join(__dirname, 'dist/browser'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'build')
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
  console.error('❌ Could not find dist directory or index.html');
  
  // Crear HTML de error para debugging
  const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Build Error - Angular App</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 40px; 
      text-align: center; 
      background: #f5f5f5;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .error { color: #e74c3c; }
    .info { color: #3498db; }
    .debug { 
      background: #ecf0f1; 
      padding: 20px; 
      border-radius: 4px; 
      text-align: left;
      margin-top: 20px;
    }
    code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="error">🚨 Angular Build Error</h1>
    <p>La aplicación Angular no se compiló correctamente en Render.</p>
    
    <div class="debug">
      <h3>🔍 Ubicaciones buscadas para index.html:</h3>
      <ul>
        ${possibleDistPaths.map(p => `<li><code>${p}/index.html</code></li>`).join('')}
      </ul>
      
      <h3>📂 Directorio actual:</h3>
      <code>${__dirname}</code>
      
      <h3>📋 Posibles causas:</h3>
      <ul>
        <li>El comando <code>ng build</code> falló durante el deploy</li>
        <li>Angular CLI no está instalado correctamente</li>
        <li>Falta configuración en <code>angular.json</code></li>
        <li>Dependencias faltantes en <code>package.json</code></li>
      </ul>
      
      <h3>🔧 Soluciones:</h3>
      <ol>
        <li>Revisar los logs de build en el dashboard de Render</li>
        <li>Verificar que <code>@angular/cli</code> esté en dependencies</li>
        <li>Comprobar que el <code>outputPath</code> en angular.json sea correcto</li>
        <li>Intentar un redeploy manual</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

  const fallbackPath = path.join(__dirname, 'error.html');
  fs.writeFileSync(fallbackPath, errorHtml);
  distPath = __dirname;
  indexPath = fallbackPath;
  console.log('✅ Error HTML created for debugging');
}

// Configurar middleware de seguridad
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Servir archivos estáticos desde el directorio dist
app.use(express.static(distPath, {
  maxAge: '1y', // Cache por 1 año para archivos estáticos
  index: false // No servir index.html automáticamente
}));

// Ruta específica para favicon
app.get('/favicon.ico', (req, res) => {
  const faviconPaths = [
    path.join(distPath, 'favicon.ico'),
    path.join(distPath, 'assets', 'favicon.ico'),
    path.join(__dirname, 'src', 'assets', 'favicon.ico'),
    path.join(__dirname, 'public', 'favicon.ico')
  ];
  
  for (const faviconPath of faviconPaths) {
    if (fs.existsSync(faviconPath)) {
      return res.sendFile(faviconPath);
    }
  }
  
  // Si no se encuentra, enviar 204 No Content
  res.status(204).end();
});

// Ruta para verificar el estado de la aplicación
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    distPath: distPath,
    indexExists: fs.existsSync(indexPath),
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Ruta para debugging (solo en desarrollo)
app.get('/debug', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const debugInfo = {
    distPath,
    indexPath,
    possiblePaths: possibleDistPaths,
    existingFiles: fs.existsSync(distPath) ? fs.readdirSync(distPath) : [],
    environment: process.env.NODE_ENV,
    pwd: process.cwd()
  };
  
  res.json(debugInfo);
});

// Catch-all handler: enviar index.html para todas las rutas que no coincidan
// Esto es necesario para que funcione el routing de Angular
app.get('*', (req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Frontend server running on port ${port}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Access the app at: http://localhost:${port}`);
  console.log(`📄 Index file: ${indexPath}`);
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Verificar archivos críticos
  const criticalFiles = ['index.html', 'main.js', 'styles.css'];
  criticalFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} found`);
    } else {
      console.log(`❌ ${file} not found`);
    }
  });
});

// Manejo de errores global
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

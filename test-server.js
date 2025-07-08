const http = require('http');
const path = require('path');
const fs = require('fs');

console.log('🔍 Testing server locally...');

// Verificar archivos
const files = [
  'server-express.js',
  'package.json',
  'angular.json',
  'render.yaml'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Verificar directorio dist
const distPaths = [
  'dist/coreui-free-angular-admin-template/browser',
  'dist/coreui-free-angular-admin-template',
  'dist/browser',
  'dist'
];

let distFound = false;
distPaths.forEach(distPath => {
  if (fs.existsSync(distPath)) {
    console.log(`✅ dist directory found at: ${distPath}`);
    distFound = true;
    
    // Verificar index.html
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`✅ index.html found at: ${indexPath}`);
    } else {
      console.log(`❌ index.html missing at: ${indexPath}`);
    }
  }
});

if (!distFound) {
  console.log('⚠️ No dist directory found. Run "npm run build" first.');
}

// Verificar dependencias
const nodeModules = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModules)) {
  console.log('✅ node_modules exists');
  
  // Verificar Express
  const expressPath = path.join(nodeModules, 'express');
  if (fs.existsSync(expressPath)) {
    console.log('✅ Express is installed');
  } else {
    console.log('❌ Express is not installed. Run "npm install express"');
  }
  
  // Verificar Angular CLI
  const angularCli = path.join(nodeModules, '@angular/cli');
  if (fs.existsSync(angularCli)) {
    console.log('✅ Angular CLI is installed');
  } else {
    console.log('❌ Angular CLI is not installed');
  }
} else {
  console.log('❌ node_modules not found. Run "npm install"');
}

// Test servidor si está corriendo
const testUrl = 'http://localhost:3000';
console.log(`\n🌐 Testing server at ${testUrl}...`);

const req = http.get(testUrl, (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`);
  console.log(`📄 Content-Type: ${res.headers['content-type']}`);
  res.on('data', (chunk) => {
    // No mostrar todo el HTML, solo verificar que hay contenido
    if (chunk.length > 0) {
      console.log(`📊 Response size: ${chunk.length} bytes`);
    }
  });
}).on('error', (err) => {
  console.log(`⚠️ Server not running or error: ${err.message}`);
  console.log('💡 Try running "npm start" to start the server');
});

// Timeout para la prueba
setTimeout(() => {
  req.destroy();
  console.log('\n✅ Local verification completed');
}, 5000);

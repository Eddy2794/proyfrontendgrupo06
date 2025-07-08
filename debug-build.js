const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUG: Analizando estado del build...');
console.log('📂 Directorio actual:', __dirname);
console.log('📅 Fecha:', new Date().toISOString());

// Verificar package.json
console.log('\n📋 Verificando package.json:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ package.json encontrado');
  console.log('  - Nombre:', packageJson.name);
  console.log('  - Scripts de build:', packageJson.scripts?.build || 'No definido');
  console.log('  - Angular CLI:', packageJson.devDependencies?.['@angular/cli'] || 'No instalado');
} else {
  console.log('❌ package.json no encontrado');
}

// Verificar angular.json
console.log('\n📋 Verificando angular.json:');
const angularPath = path.join(__dirname, 'angular.json');
if (fs.existsSync(angularPath)) {
  const angularJson = JSON.parse(fs.readFileSync(angularPath, 'utf8'));
  console.log('✅ angular.json encontrado');
  const buildConfig = angularJson.projects?.['coreui-free-angular-admin-template']?.architect?.build;
  if (buildConfig) {
    console.log('  - Output path:', buildConfig.options?.outputPath || 'No definido');
    console.log('  - Builder:', buildConfig.builder || 'No definido');
  }
} else {
  console.log('❌ angular.json no encontrado');
}

// Verificar directorio dist
console.log('\n📁 Verificando directorio dist:');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ Directorio dist encontrado');
  
  function listDirectory(dirPath, prefix = '', maxDepth = 3) {
    if (maxDepth <= 0) return;
    
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      items.forEach(item => {
        const itemPath = path.join(dirPath, item.name);
        const stat = fs.statSync(itemPath);
        const size = stat.isFile() ? `(${(stat.size / 1024).toFixed(1)}KB)` : '';
        
        console.log(`${prefix}${item.isDirectory() ? '📁' : '📄'} ${item.name} ${size}`);
        
        if (item.isDirectory()) {
          listDirectory(itemPath, prefix + '  ', maxDepth - 1);
        }
      });
    } catch (err) {
      console.log(`${prefix}❌ Error leyendo directorio: ${err.message}`);
    }
  }
  
  listDirectory(distPath);
} else {
  console.log('❌ Directorio dist no encontrado');
}

// Verificar si existe index.html en las ubicaciones esperadas
console.log('\n🔍 Verificando index.html:');
const possibleIndexPaths = [
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/browser/index.html'),
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/index.html'),
  path.join(__dirname, 'dist/browser/index.html'),
  path.join(__dirname, 'dist/index.html')
];

let indexFound = false;
possibleIndexPaths.forEach(indexPath => {
  if (fs.existsSync(indexPath)) {
    console.log(`✅ index.html encontrado en: ${indexPath}`);
    const stat = fs.statSync(indexPath);
    console.log(`  - Tamaño: ${(stat.size / 1024).toFixed(1)}KB`);
    console.log(`  - Modificado: ${stat.mtime.toISOString()}`);
    indexFound = true;
  } else {
    console.log(`❌ index.html NO encontrado en: ${indexPath}`);
  }
});

if (!indexFound) {
  console.log('⚠️ No se encontró index.html en ninguna ubicación esperada');
}

// Verificar node_modules
console.log('\n📦 Verificando node_modules:');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules encontrado');
  
  // Verificar Angular CLI
  const angularCliPath = path.join(nodeModulesPath, '@angular/cli');
  if (fs.existsSync(angularCliPath)) {
    console.log('  ✅ @angular/cli instalado');
  } else {
    console.log('  ❌ @angular/cli NO instalado');
  }
  
  // Verificar Angular core
  const angularCorePath = path.join(nodeModulesPath, '@angular/core');
  if (fs.existsSync(angularCorePath)) {
    console.log('  ✅ @angular/core instalado');
  } else {
    console.log('  ❌ @angular/core NO instalado');
  }
} else {
  console.log('❌ node_modules no encontrado');
}

// Verificar archivos de configuración
console.log('\n⚙️ Verificando archivos de configuración:');
const configFiles = [
  'tsconfig.json',
  'tsconfig.app.json',
  'render.yaml',
  'server.js',
  'postbuild.js'
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    console.log(`✅ ${file} (${(stat.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`❌ ${file} NO encontrado`);
  }
});

console.log('\n✅ Análisis de debugging completado');

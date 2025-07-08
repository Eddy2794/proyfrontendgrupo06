const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando verificación post-build...');
console.log('📂 Directorio actual:', __dirname);

// Posibles rutas donde puede estar el index.html
const possiblePaths = [
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/browser/index.html'),
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/index.html'),
  path.join(__dirname, 'dist/browser/index.html'),
  path.join(__dirname, 'dist/index.html')
];

let indexFound = false;
let foundPath = '';
let distDir = '';

// Verificar cada posible ruta
for (const indexPath of possiblePaths) {
  console.log('🔍 Verificando:', indexPath);
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html encontrado en:', indexPath);
    indexFound = true;
    foundPath = indexPath;
    distDir = path.dirname(indexPath);
    break;
  }
}

if (!indexFound) {
  console.error('❌ No se encontró index.html en ninguna de las rutas esperadas');
  
  // Listar contenido del directorio dist para debug
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('📁 Contenido de dist:');
    
    function listDirectory(dirPath, prefix = '') {
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        items.forEach(item => {
          const itemPath = path.join(dirPath, item.name);
          console.log(`${prefix}${item.isDirectory() ? '📁' : '📄'} ${item.name}`);
          
          if (item.isDirectory() && prefix.length < 8) { // Limitar la profundidad
            listDirectory(itemPath, prefix + '  ');
          }
        });
      } catch (err) {
        console.log(`${prefix}❌ Error leyendo directorio: ${err.message}`);
      }
    }
    
    listDirectory(distPath);
  } else {
    console.log('❌ El directorio dist no existe');
  }
  
  process.exit(1);
}

// Verificar favicon
const faviconPath = path.join(distDir, 'favicon.ico');
console.log('🔍 Verificando favicon en:', faviconPath);
if (fs.existsSync(faviconPath)) {
  console.log('✅ favicon.ico encontrado');
} else {
  console.log('⚠️ favicon.ico no encontrado, copiando desde assets...');
  const sourceFavicon = path.join(__dirname, 'src/assets/favicon.ico');
  if (fs.existsSync(sourceFavicon)) {
    fs.copyFileSync(sourceFavicon, faviconPath);
    console.log('✅ favicon.ico copiado exitosamente');
  } else {
    console.log('⚠️ favicon.ico no encontrado en src/assets/');
  }
}

// Verificar _redirects para hash routing
const redirectsPath = path.join(distDir, '_redirects');
console.log('🔍 Verificando _redirects en:', redirectsPath);
if (!fs.existsSync(redirectsPath)) {
  console.log('📝 Creando archivo _redirects para hash routing...');
  fs.writeFileSync(redirectsPath, '/*    /index.html   200\n');
  console.log('✅ _redirects creado exitosamente');
} else {
  console.log('✅ _redirects ya existe');
}

// Verificar assets directory
const assetsPath = path.join(distDir, 'assets');
console.log('🔍 Verificando directorio assets en:', assetsPath);
if (fs.existsSync(assetsPath)) {
  console.log('✅ Directorio assets encontrado');
  
  // Verificar favicon en assets también
  const assetsFaviconPath = path.join(assetsPath, 'favicon.ico');
  if (fs.existsSync(assetsFaviconPath)) {
    console.log('✅ favicon.ico encontrado en assets');
  } else {
    console.log('⚠️ favicon.ico no encontrado en assets, copiando...');
    const sourceFavicon = path.join(__dirname, 'src/assets/favicon.ico');
    if (fs.existsSync(sourceFavicon)) {
      fs.copyFileSync(sourceFavicon, assetsFaviconPath);
      console.log('✅ favicon.ico copiado a assets exitosamente');
    }
  }
} else {
  console.log('⚠️ Directorio assets no encontrado');
}

console.log('✅ Build completado exitosamente');
console.log('📁 Archivo index.html encontrado en:', foundPath);
console.log('📁 Directorio de distribución:', distDir);

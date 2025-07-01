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

// Verificar cada posible ruta
for (const indexPath of possiblePaths) {
  console.log('🔍 Verificando:', indexPath);
  if (fs.existsSync(indexPath)) {
    indexFound = true;
    foundPath = indexPath;
    break;
  }
}

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

if (indexFound) {
  console.log('✅ Build completado exitosamente');
  console.log('📁 Archivo index.html encontrado en:', foundPath);
} else {
  console.error('❌ Error: No se encontró el archivo index.html en ninguna ubicación esperada');
  console.error('🔍 Rutas verificadas:');
  possiblePaths.forEach(p => console.error(`   - ${p}`));
  process.exit(1);
}

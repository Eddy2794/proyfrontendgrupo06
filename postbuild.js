const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando verificación post-build...');
console.log('📂 Directorio actual:', __dirname);

// Posibles rutas donde puede estar el index.html
const possiblePaths = [
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/index.html'),
  path.join(__dirname, 'dist/index.html'),
  path.join(__dirname, 'dist/coreui-free-angular-admin-template/browser/index.html')
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
  const distContents = fs.readdirSync(distPath, { withFileTypes: true });
  distContents.forEach(item => {
    console.log(`  ${item.isDirectory() ? '📁' : '📄'} ${item.name}`);
    if (item.isDirectory()) {
      const subPath = path.join(distPath, item.name);
      try {
        const subContents = fs.readdirSync(subPath);
        subContents.forEach(subItem => {
          console.log(`    📄 ${subItem}`);
        });
      } catch (err) {
        console.log(`    ❌ Error leyendo subdirectorio: ${err.message}`);
      }
    }
  });
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

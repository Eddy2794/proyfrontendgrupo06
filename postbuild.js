const fs = require('fs');
const path = require('path');

// Ruta al archivo index.html generado
const indexPath = path.join(__dirname, 'dist/coreui-free-angular-admin-template/index.html');

// Verificar si el archivo existe
if (fs.existsSync(indexPath)) {
  console.log('✅ Build completado exitosamente');
  console.log('📁 Archivos estáticos generados en: dist/coreui-free-angular-admin-template');
} else {
  console.error('❌ Error: No se encontró el archivo index.html en la carpeta dist');
  process.exit(1);
}

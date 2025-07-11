const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo importaciones de jsPDF y html2canvas...');

// Archivos que necesitan corrección basados en los errores
const filesToFix = [
  'src/app/views/categoria/categoria.component.ts',
  'src/app/views/perfil/perfil.component.ts',
  'src/app/views/profesor-list/profesor-list.component.ts',
  'src/app/views/torneo/torneo.component.ts',
  'src/app/views/alumno/alumno-list/alumno-list.component.ts',
  'src/app/views/alumno/alumno-detalle-modal.component.ts'
];

// Función para corregir un archivo
function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Comentar imports de ES6
  content = content.replace(/import { jsPDF } from 'jspdf';/g, "// import { jsPDF } from 'jspdf'; // Usando versión global");
  content = content.replace(/import html2canvas from 'html2canvas';/g, "// import html2canvas from 'html2canvas'; // Usando versión global");
  
  // Reemplazar llamadas por versiones globales
  content = content.replace(/new jsPDF\(/g, 'new (window as any).jspdf.jsPDF(');
  content = content.replace(/html2canvas\(/g, '(window as any).html2canvas(');
  
  // Corregir parámetros sin tipo
  content = content.replace(/\.then\(canvas => \{/g, '.then((canvas: HTMLCanvasElement) => {');
  content = content.replace(/\.catch\(error => \{/g, '.catch((error: any) => {');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Corregido: ${filePath}`);
}

// Corregir cada archivo
filesToFix.forEach(fixFile);

console.log('✅ Corrección de importaciones completada');

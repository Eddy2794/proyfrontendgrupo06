const fs = require('fs');
const path = require('path');

console.log('🔧 Aplicando correcciones avanzadas para métodos PDF...');

// Archivos que necesitan corrección avanzada
const filesToFix = [
  'src/app/views/profesor-list/profesor-list.component.ts',
  'src/app/views/perfil/perfil.component.ts',
  'src/app/views/alumno/alumno-list/alumno-list.component.ts',
  'src/app/views/alumno/alumno-detalle-modal.component.ts'
];

// Función para agregar funciones de carga dinámica si no existen
function addPDFLoadingFunctions(content) {
  if (content.includes('loadPDFLibraries')) {
    return content; // Ya tiene las funciones
  }

  const loadingFunctions = `
  /**
   * Carga las librerías PDF de forma dinámica
   */
  private async loadPDFLibraries(): Promise<void> {
    // Verificar si las librerías ya están cargadas
    if (typeof (window as any).jspdf !== 'undefined' && typeof (window as any).html2canvas !== 'undefined') {
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];
    
    if (typeof (window as any).jspdf === 'undefined') {
      promises.push(this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
    }
    
    if (typeof (window as any).html2canvas === 'undefined') {
      promises.push(this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
    }

    await Promise.all(promises);
  }

  /**
   * Carga un script de forma dinámica
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(\`Failed to load script: \${src}\`));
      document.head.appendChild(script);
    });
  }
`;

  // Buscar el constructor y agregar las funciones después
  const constructorMatch = content.match(/(constructor\([^}]+\}\s*)/);
  if (constructorMatch) {
    const insertPoint = constructorMatch.index + constructorMatch[0].length;
    content = content.slice(0, insertPoint) + loadingFunctions + content.slice(insertPoint);
  }

  return content;
}

// Función para actualizar métodos PDF
function updatePDFMethods(content) {
  // Cambiar firmas de métodos PDF a async
  content = content.replace(
    /(\w+PDF\(\)): void \{/g,
    '$1: Promise<void> {\n    try {\n      // Cargar librerías PDF dinámicamente\n      await this.loadPDFLibraries();\n    } catch (error) {\n      console.error(\'Error cargando librerías PDF:\', error);\n      this.notificationService.showError(\'Error\', \'No se pudieron cargar las librerías necesarias para generar el PDF\');\n      return;\n    }'
  );

  // Hacer los métodos async
  content = content.replace(
    /(\w+PDF\(\)): Promise<void> \{/g,
    'async $1: Promise<void> {'
  );

  // Actualizar llamadas a las librerías usando variables locales
  content = content.replace(
    /\(window as any\)\.html2canvas\(elementoTemporal, opciones\)\.then\(\(canvas: HTMLCanvasElement\) => \{\s*document\.body\.removeChild\(elementoTemporal\);\s*const imgData = canvas\.toDataURL\('image\/png'\);\s*const pdf = new \(window as any\)\.jspdf\.jsPDF\(/g,
    `// Obtener referencias locales a las librerías
    const jsPDFLib = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
    const html2canvasLib = (window as any).html2canvas;

    if (!jsPDFLib) {
      throw new Error('jsPDF no está disponible');
    }

    if (!html2canvasLib) {
      throw new Error('html2canvas no está disponible');
    }

    html2canvasLib(elementoTemporal, opciones).then((canvas: HTMLCanvasElement) => {
      document.body.removeChild(elementoTemporal);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFLib(`
  );

  return content;
}

// Función para agregar declaraciones de variables si no existen
function addVariableDeclarations(content) {
  if (content.includes('declare var jsPDF')) {
    return content; // Ya tiene las declaraciones
  }

  const declarations = `
// Declaración de variables globales para las librerías PDF
declare var jsPDF: any;
declare var html2canvas: any;`;

  // Insertar después de los imports comentados
  content = content.replace(
    /(\/\/ import html2canvas from 'html2canvas'; \/\/ Usando versión global)/,
    '$1' + declarations
  );

  return content;
}

// Función para corregir un archivo
function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  console.log(`🔧 Procesando: ${filePath}`);
  
  // Aplicar correcciones
  content = addVariableDeclarations(content);
  content = addPDFLoadingFunctions(content);
  content = updatePDFMethods(content);
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Corregido: ${filePath}`);
}

// Corregir cada archivo
filesToFix.forEach(fixFile);

console.log('✅ Corrección avanzada de métodos PDF completada');

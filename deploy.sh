#!/bin/bash

echo "🚀 Deploy Script for Render"
echo "=========================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar Node.js
log "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
    exit 1
fi
info "Node.js $(node --version) detectado"

# Verificar package manager
log "Verificando package manager..."
if command -v pnpm &> /dev/null; then
    PM="pnpm"
    info "Usando pnpm $(pnpm --version)"
elif command -v npm &> /dev/null; then
    PM="npm"
    info "Usando npm $(npm --version)"
else
    error "No se encontró pnpm ni npm"
    exit 1
fi

# Limpiar build anterior
log "Limpiando build anterior..."
if [ -d "dist" ]; then
    rm -rf dist/
    info "Directorio dist eliminado"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache/
    info "Cache eliminado"
fi

# Instalar dependencias
log "Instalando dependencias..."
if [ "$PM" = "pnpm" ]; then
    pnpm install --no-frozen-lockfile --production=false
else
    npm install --no-package-lock --production=false
fi

if [ $? -ne 0 ]; then
    error "Error instalando dependencias"
    exit 1
fi

# Verificar Angular CLI
log "Verificando Angular CLI..."
if [ -f "node_modules/.bin/ng" ]; then
    info "Angular CLI encontrado localmente"
    NG_CMD="./node_modules/.bin/ng"
elif command -v ng &> /dev/null; then
    info "Angular CLI encontrado globalmente"
    NG_CMD="ng"
else
    warning "Angular CLI no encontrado, instalando..."
    npm install -g @angular/cli@latest
    NG_CMD="ng"
fi

# Mostrar versión de Angular CLI
$NG_CMD version

# Construir aplicación
log "Construyendo aplicación Angular..."
$NG_CMD build --configuration production --verbose

if [ $? -ne 0 ]; then
    error "Error en el build de Angular"
    exit 1
fi

# Verificar output del build
log "Verificando output del build..."
if [ -d "dist" ]; then
    info "Directorio dist creado exitosamente"
    
    # Buscar index.html
    INDEX_FOUND=false
    for path in "dist/coreui-free-angular-admin-template/browser" "dist/coreui-free-angular-admin-template" "dist/browser" "dist"; do
        if [ -f "$path/index.html" ]; then
            info "index.html encontrado en: $path"
            INDEX_FOUND=true
            DIST_PATH="$path"
            break
        fi
    done
    
    if [ "$INDEX_FOUND" = false ]; then
        error "index.html no encontrado"
        exit 1
    fi
else
    error "Directorio dist no fue creado"
    exit 1
fi

# Ejecutar postbuild
log "Ejecutando postbuild..."
node postbuild.js

if [ $? -ne 0 ]; then
    error "Error en postbuild"
    exit 1
fi

# Verificar archivos críticos
log "Verificando archivos críticos..."
CRITICAL_FILES=("index.html" "main.js" "styles.css" "favicon.ico")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$DIST_PATH/$file" ]; then
        info "$file ✅"
    else
        warning "$file ⚠️ no encontrado"
    fi
done

# Verificar servidor
log "Verificando servidor..."
if [ -f "server-express.js" ]; then
    info "server-express.js encontrado ✅"
else
    error "server-express.js no encontrado"
    exit 1
fi

# Verificar Express
if [ -d "node_modules/express" ]; then
    info "Express instalado ✅"
else
    error "Express no instalado"
    exit 1
fi

# Mostrar estadísticas finales
log "Estadísticas del build:"
if [ -d "$DIST_PATH" ]; then
    BUILD_SIZE=$(du -sh "$DIST_PATH" 2>/dev/null | cut -f1)
    info "Tamaño del build: $BUILD_SIZE"
    
    JS_COUNT=$(find "$DIST_PATH" -name "*.js" -type f | wc -l)
    CSS_COUNT=$(find "$DIST_PATH" -name "*.css" -type f | wc -l)
    info "Archivos JS: $JS_COUNT"
    info "Archivos CSS: $CSS_COUNT"
fi

log "🎉 Build completado exitosamente"
info "La aplicación está lista para deployar en Render"
info "Usar: node server-express.js para iniciar el servidor"

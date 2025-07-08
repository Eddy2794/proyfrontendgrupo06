#!/bin/bash

echo "🚀 Pre-deploy verification script"
echo "=================================="

# Verificar Node.js
echo "🔍 Verificando Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node --version) encontrado"
else
    echo "❌ Node.js no encontrado"
    exit 1
fi

# Verificar npm/pnpm
echo "🔍 Verificando package manager..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm $(pnpm --version) encontrado"
    PM="pnpm"
elif command -v npm &> /dev/null; then
    echo "✅ npm $(npm --version) encontrado"
    PM="npm"
else
    echo "❌ Ni pnpm ni npm encontrados"
    exit 1
fi

# Limpiar cache y build anterior
echo "🧹 Limpiando cache y build anterior..."
if [ -d "dist" ]; then
    rm -rf dist/
    echo "✅ Directorio dist eliminado"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache/
    echo "✅ Cache de node_modules eliminado"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
if [ "$PM" = "pnpm" ]; then
    pnpm install --no-frozen-lockfile
else
    npm install
fi

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Verificar Angular CLI
echo "🔍 Verificando Angular CLI..."
if [ -f "node_modules/.bin/ng" ]; then
    echo "✅ Angular CLI encontrado en node_modules"
    NG_CMD="./node_modules/.bin/ng"
elif command -v ng &> /dev/null; then
    echo "✅ Angular CLI encontrado globalmente"
    NG_CMD="ng"
else
    echo "❌ Angular CLI no encontrado"
    exit 1
fi

# Ejecutar build
echo "🔨 Ejecutando build..."
$NG_CMD build --configuration production --verbose

if [ $? -eq 0 ]; then
    echo "✅ Build completado exitosamente"
else
    echo "❌ Error en el build"
    exit 1
fi

# Ejecutar postbuild
echo "🔧 Ejecutando postbuild..."
node postbuild.js

if [ $? -eq 0 ]; then
    echo "✅ Postbuild completado exitosamente"
else
    echo "❌ Error en postbuild"
    exit 1
fi

# Verificar archivos críticos
echo "🔍 Verificando archivos críticos..."
DIST_PATHS=(
    "dist/coreui-free-angular-admin-template/browser"
    "dist/coreui-free-angular-admin-template"
    "dist/browser"
    "dist"
)

INDEX_FOUND=false
for path in "${DIST_PATHS[@]}"; do
    if [ -f "$path/index.html" ]; then
        echo "✅ index.html encontrado en: $path"
        INDEX_FOUND=true
        DIST_DIR="$path"
        break
    fi
done

if [ "$INDEX_FOUND" = false ]; then
    echo "❌ index.html no encontrado en ninguna ubicación"
    exit 1
fi

# Verificar favicon
if [ -f "$DIST_DIR/favicon.ico" ]; then
    echo "✅ favicon.ico encontrado"
else
    echo "⚠️ favicon.ico no encontrado"
fi

# Verificar archivos JS y CSS
JS_COUNT=$(find "$DIST_DIR" -name "*.js" -type f | wc -l)
CSS_COUNT=$(find "$DIST_DIR" -name "*.css" -type f | wc -l)

echo "📄 Archivos JS encontrados: $JS_COUNT"
echo "📄 Archivos CSS encontrados: $CSS_COUNT"

if [ $JS_COUNT -eq 0 ]; then
    echo "❌ No se encontraron archivos JS"
    exit 1
fi

# Verificar servidor
echo "🔍 Verificando servidor..."
if [ -f "server.js" ]; then
    echo "✅ server.js encontrado"
else
    echo "❌ server.js no encontrado"
    exit 1
fi

# Verificar configuración de Render
echo "🔍 Verificando configuración de Render..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml encontrado"
else
    echo "❌ render.yaml no encontrado"
    exit 1
fi

echo ""
echo "✅ Pre-deploy verification completada exitosamente"
echo "🚀 La aplicación está lista para desplegar"
echo "📁 Directorio de distribución: $DIST_DIR"
echo "📄 Tamaño del build: $(du -sh $DIST_DIR | cut -f1)"

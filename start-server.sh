#!/bin/bash

# Script de inicio robusto para Render
echo "🚀 Starting Angular Frontend Server..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Verificar que existe el servidor
if [ ! -f "server-express.js" ]; then
    echo "❌ server-express.js not found"
    exit 1
fi

# Verificar que Express está instalado
if [ ! -d "node_modules/express" ]; then
    echo "❌ Express not found, installing..."
    npm install express
fi

# Verificar que existe el directorio dist
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found"
    exit 1
fi

# Iniciar el servidor con manejo de errores
echo "🔧 Starting server with error handling..."

# Usar exec para reemplazar el proceso bash con node
exec node server-express.js

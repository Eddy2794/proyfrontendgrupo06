#!/bin/bash

echo "📦 Installing Express for server..."

# Verificar si package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

# Instalar Express
echo "🔧 Installing express..."
if command -v pnpm &> /dev/null; then
    pnpm add express
elif command -v npm &> /dev/null; then
    npm install express
else
    echo "❌ Neither pnpm nor npm found"
    exit 1
fi

echo "✅ Express installed successfully"

# Verificar instalación
if [ -d "node_modules/express" ]; then
    echo "✅ Express installation verified"
else
    echo "❌ Express installation failed"
    exit 1
fi

echo "🚀 Ready to run with Express server"

@echo off
echo 🚀 Local Deploy Test Script
echo ==========================

REM Limpiar build anterior
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Instalar dependencias
echo 📦 Installing dependencies...
pnpm install --no-frozen-lockfile

REM Verificar Angular CLI
echo 🔍 Checking Angular CLI...
if exist node_modules\.bin\ng (
    echo ✅ Angular CLI found locally
    set NG_CMD=node_modules\.bin\ng
) else (
    echo ❌ Angular CLI not found locally
    npm install -g @angular/cli@latest
    set NG_CMD=ng
)

REM Build de producción
echo 🔨 Building for production...
%NG_CMD% build --configuration production --verbose

REM Verificar build
if exist dist (
    echo ✅ Build successful
) else (
    echo ❌ Build failed
    pause
    exit /b 1
)

REM Ejecutar postbuild
echo 🔧 Running postbuild...
node postbuild.js

REM Verificar servidor
echo 🔍 Checking server...
if exist server-express.js (
    echo ✅ Server file found
) else (
    echo ❌ Server file not found
    pause
    exit /b 1
)

REM Iniciar servidor
echo 🚀 Starting server...
echo URL: http://localhost:3000
echo Press Ctrl+C to stop

node server-express.js

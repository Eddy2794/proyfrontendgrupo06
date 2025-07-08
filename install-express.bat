@echo off
echo 📦 Installing Express for server...

REM Verificar si package.json existe
if not exist "package.json" (
    echo ❌ package.json not found
    exit /b 1
)

REM Instalar Express
echo 🔧 Installing express...
where pnpm >nul 2>nul
if %errorlevel% == 0 (
    pnpm add express
) else (
    where npm >nul 2>nul
    if %errorlevel% == 0 (
        npm install express
    ) else (
        echo ❌ Neither pnpm nor npm found
        exit /b 1
    )
)

echo ✅ Express installed successfully

REM Verificar instalación
if exist "node_modules\express" (
    echo ✅ Express installation verified
) else (
    echo ❌ Express installation failed
    exit /b 1
)

echo 🚀 Ready to run with Express server
pause

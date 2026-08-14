@echo off
setlocal
cd /d "%~dp0frontend"
echo === Instalando dependencias del frontend ===
call npm install
if errorlevel 1 goto :error

echo === Construyendo el frontend (npm run build) ===
call npm run build
if errorlevel 1 goto :error

cd /d "%~dp0backend"
echo === Recolectando archivos estaticos (collectstatic) ===
call .venv\Scripts\python.exe manage.py collectstatic --noinput
if errorlevel 1 goto :error

echo.
echo Listo. Ahora puedes ejecutar Iniciar_Servidor.bat
goto :eof

:error
echo.
echo Ocurrio un error durante la construccion del frontend.
exit /b 1

@echo off
setlocal
cd /d "%~dp0backend"
echo === bITacora - iniciando servidor en http://127.0.0.1:5012 ===
echo (Deja esta ventana abierta mientras uses la app. Cierra con Ctrl+C.)
.venv\Scripts\waitress-serve.exe --host=0.0.0.0 --port=5012 bitacora_project.wsgi:application
pause

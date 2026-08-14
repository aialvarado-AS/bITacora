# bITacora

App interna de gestion para Agrosuper: Compras, Proyectos, Requerimientos internos,
Mantenimientos y Bitacora, con responsables, plazos, semaforo de vencimiento y
recordatorios por correo. Backend Django + PostgreSQL, frontend React (Vite).

## Estructura

```
backend/    Django + DRF + JWT, PostgreSQL vía django-environ (.env)
frontend/   React + Vite + TypeScript, glassmorphism, colores Agrosuper
```

## Primer arranque en un equipo nuevo

1. PostgreSQL instalado localmente, con una base `bitacora_db` y un usuario
   dedicado (ver credenciales en `backend/.env`, no se sube a ningun repo).
2. `backend`: crear entorno virtual e instalar dependencias:
   ```
   cd backend
   python -m venv .venv
   .venv\Scripts\pip install -r requirements.txt
   ```
3. Copiar `backend/.env.example` a `backend/.env` y completar credenciales de
   base de datos (y de correo cuando corresponda — ver seccion SMTP abajo).
4. Migrar y crear el primer usuario administrador:
   ```
   .venv\Scripts\python manage.py migrate
   .venv\Scripts\python manage.py createsuperuser
   ```
   Despues de crearlo, entrar a `/django-admin/` y setear su campo `rol` en
   `ADMIN` (createsuperuser no lo hace automaticamente).
5. Construir el frontend: doble clic en `Construir_Frontend.bat` (o
   `cd frontend && npm install && npm run build` seguido de
   `cd backend && .venv\Scripts\python manage.py collectstatic --noinput`).
6. Iniciar el servidor: doble clic en `Iniciar_Servidor.bat`. La app queda
   disponible en http://localhost:5012 (deja la ventana abierta).

## Desarrollo activo del frontend

`cd frontend && npm run dev` levanta Vite en el puerto 5187 con proxy de
`/api` hacia `http://localhost:5012` (el backend debe estar corriendo con
`Iniciar_Servidor.bat`, o con `python manage.py runserver 5012` para
recargar cambios de Python al vuelo).

## Correo / recordatorios (SMTP)

**Resultado de la prueba real (12-08-2026):** "Direct Send" (puerto 25,
sin autenticacion, hacia `agrosuper-com.mail.protection.outlook.com`) **no
funciona** desde esta red — la conexion TCP se abre pero el servidor nunca
responde con el saludo SMTP (se cuelga hasta agotar el timeout). Esto es
un bloqueo silencioso, no un rechazo activo: puede ser una politica
anti-spoofing del tenant de Microsoft 365, o el firewall corporativo
filtrando el puerto 25 especificamente.

En cambio, **el puerto 587 hacia `smtp.office365.com` funciona
perfectamente** (se probo el saludo SMTP + EHLO, ambos exitosos sin
ningun bloqueo de red). Esto confirma que la opcion viable es:

**Pedir a un administrador de Microsoft 365 una casilla de servicio con
SMTP autenticado habilitado** (por ejemplo `bitacora@agrosuper.com`), y
configurar en `.env`:

```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=bitacora@agrosuper.com
EMAIL_HOST_PASSWORD=<la contraseña o app password de esa casilla>
```

Nota: muchos tenants de M365 tienen deshabilitada la autenticacion basica
SMTP por politica de seguridad — si el administrador ve que falla incluso
con la contraseña correcta, pedirle que habilite "SMTP AUTH" especificamente
para esa casilla de servicio (Centro de administracion de Exchange →
buzones → esa casilla → Configuracion de correo → Autenticacion SMTP).

Antes de activar `EMAIL_ENABLED=True` en `.env`, siempre probar la entrega
real con:

```
.venv\Scripts\python manage.py probar_email --to tu_correo@agrosuper.com
```

El envio real de recordatorios corre con:

```
.venv\Scripts\python manage.py enviar_recordatorios
```

Este comando debe programarse una vez en el **Programador de tareas de
Windows** para que corra automaticamente todos los dias (por ejemplo a las
08:00), independiente de si alguien tiene la app abierta:

1. Abrir "Programador de tareas" → Crear tarea basica.
2. Desencadenador: diario, a la hora deseada.
3. Accion: iniciar un programa.
   - Programa: `C:\Proyectos_IA\bITacora\backend\.venv\Scripts\python.exe`
   - Argumentos: `manage.py enviar_recordatorios`
   - Iniciar en: `C:\Proyectos_IA\bITacora\backend`

Mientras `EMAIL_ENABLED=False`, el semaforo visual del dashboard (verde /
amarillo / rojo) sigue funcionando igual — no depende del correo.

## Usuario administrador inicial

Se creo un usuario `admin` (rol ADMIN) durante la puesta en marcha. Cambia
su contraseña desde `/admin/usuarios` (o `/django-admin/` de Django) apenas
tengas acceso.

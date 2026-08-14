# Despliegue en la PC servidor (192.168.22.220)

Esta guía instala bITácora en una PC distinta a la de desarrollo, para que
todos accedan por red a `http://192.168.22.220:5012/`. Esa PC **ya tiene un
PostgreSQL en uso por otro sistema (puerto 5432)** — no lo tocamos. bITácora
usa su propio PostgreSQL nuevo en el **puerto 5433**.

El frontend ya viene **compilado** dentro de `frontend/dist/` en el zip —
no necesitas instalar Node.js en esta PC salvo que más adelante quieras
modificar el frontend ahí mismo.

## 0. Requisitos

- Windows con acceso de administrador.
- Python 3.12+ instalado (verificar con `python --version`; si no está,
  descargarlo de https://www.python.org/downloads/ marcando "Add to PATH").
- Conexión a internet (para `pip install`).

## 1. Copiar el proyecto

Descomprime el zip en `C:\Proyectos_IA\bITacora` (o la ruta que prefieras;
si usas otra, ajusta las rutas del resto de esta guía).

## 2. Instalar PostgreSQL nuevo (puerto 5433, sin tocar el existente)

```powershell
winget install --id PostgreSQL.PostgreSQL.16 -e --silent --accept-package-agreements --accept-source-agreements --override "--mode unattended --unattendedmodeui minimal --superpassword CAMBIA_ESTA_CLAVE --servicename postgresql-x64-16-bitacora --serverport 5433"
```

Reemplaza `CAMBIA_ESTA_CLAVE` por una contraseña propia para el superusuario
`postgres` de esta instancia nueva (anótala, la necesitas en el paso 4).

Verifica que quedó arriba y en el puerto correcto (y que **no** interfirió
con el PostgreSQL existente en 5432):

```powershell
Get-Service -Name "*postgres*"
Get-NetTCPConnection -LocalPort 5432,5433 -State Listen
```

Si ves un servicio extra o el puerto 5433 no aparece, avísame antes de
seguir — en la instalación de referencia esto generó un instalador
duplicado inesperado y hubo que resolverlo a mano.

Crea la base y el usuario para la app (ajusta `TU_CLAVE_POSTGRES` a la que
pusiste arriba, y `TU_CLAVE_APP` a una nueva para el rol de la aplicación):

```powershell
$env:PGPASSWORD = "TU_CLAVE_POSTGRES"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
& $psql -U postgres -h 127.0.0.1 -p 5433 -c "CREATE USER bitacora_app WITH PASSWORD 'TU_CLAVE_APP';"
& $psql -U postgres -h 127.0.0.1 -p 5433 -c "CREATE DATABASE bitacora_db OWNER bitacora_app;"
```

## 3. Entorno Python

```powershell
cd C:\Proyectos_IA\bITacora\backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
```

## 4. Configurar `.env`

Genera un `SECRET_KEY` nuevo (nunca reutilizar el de desarrollo ni el de
otra PC):

```powershell
.venv\Scripts\python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Crea `C:\Proyectos_IA\bITacora\backend\.env` con este contenido (reemplaza
`TU_CLAVE_APP` por la que usaste arriba y `TU_SECRET_KEY_NUEVO` por el que
acabas de generar):

```
DEBUG=False
SECRET_KEY=TU_SECRET_KEY_NUEVO
ALLOWED_HOSTS=192.168.22.220

DB_NAME=bitacora_db
DB_USER=bitacora_app
DB_PASSWORD=TU_CLAVE_APP
DB_HOST=127.0.0.1
DB_PORT=5433

CORS_ALLOWED_ORIGINS=http://192.168.22.220:5012

EMAIL_ENABLED=False
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_TIMEOUT=10
DEFAULT_FROM_EMAIL=bitacora@agrosuper.com
EMAIL_DEV_REDIRECT_TO=

DIAS_ALERTA_AMARILLO=3
```

El `SECRET_KEY` debe ser propio de esta PC — nunca reutilizar el mismo
entre ambientes (desarrollo, esta PC, o cualquier otra).

**Importante:** `DEBUG=False` porque esta PC va a estar expuesta a toda la
red — nunca dejar `DEBUG=True` en un servidor que otras personas van a
usar (expone información interna en cualquier error).

## 5. Migrar y crear el usuario administrador

```powershell
cd C:\Proyectos_IA\bITacora\backend
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py createsuperuser
```

Después de crearlo, entra a `.venv\Scripts\python manage.py shell` y corre:

```python
from accounts.models import Usuario
u = Usuario.objects.get(username="<el usuario que creaste>")
u.rol = "ADMIN"
u.save()
exit()
```

## 6. Preparar archivos estáticos

```powershell
.venv\Scripts\python manage.py collectstatic --noinput
```

(El frontend ya está compilado en `frontend/dist/` dentro del zip — este
paso solo copia esos archivos + los de Django admin a `staticfiles/`.)

## 7. Abrir el puerto 5012 en el Firewall de Windows

```powershell
New-NetFirewallRule -DisplayName "bITacora (5012)" -Direction Inbound -Protocol TCP -LocalPort 5012 -Action Allow
```

## 8. Iniciar el servidor

Doble clic en `Iniciar_Servidor.bat` (en la raíz del proyecto). Déjalo
corriendo — mientras esa ventana esté abierta, todos pueden entrar a
`http://192.168.22.220:5012/`.

## 9. Que arranque solo al reiniciar la PC (recomendado)

Para que no dependa de que alguien abra manualmente la ventana después de
un reinicio o corte de luz, crea una tarea programada que la inicie sola:

```powershell
$accion = New-ScheduledTaskAction -Execute "C:\Proyectos_IA\bITacora\Iniciar_Servidor.bat"
$disparador = New-ScheduledTaskTrigger -AtStartup
$config = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName "bITacora - Servidor" -Action $accion -Trigger $disparador -Settings $config -RunLevel Highest -User "SYSTEM"
```

También conviene desactivar la suspensión automática de esta PC
(Configuración → Sistema → Energía → "Nunca" suspender), para que no se
desconecte de la red mientras nadie la esté usando directamente.

## 10. Probar desde otra máquina

Desde cualquier PC de la misma red: abrir el navegador en
`http://192.168.22.220:5012/` y hacer login con el usuario administrador
creado en el paso 5.

## Correo (cuando tengas las credenciales de M365)

Ver la sección "Correo / recordatorios (SMTP)" del `README.md` — una vez
que un administrador de M365 te dé una casilla con SMTP AUTH habilitado,
completa `EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD` en este `.env`, prueba con
`probar_email`, y recién ahí pon `EMAIL_ENABLED=True`. La tarea programada
para `enviar_recordatorios` (diaria) se documenta ahí también.

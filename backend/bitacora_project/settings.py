"""
Django settings for bitacora_project project.

Generado a partir de 'django-admin startproject', adaptado para bITacora
(Django 6.1, DRF, JWT, PostgreSQL, CORS, WhiteNoise).

Para mas informacion sobre este archivo, ver:
https://docs.djangoproject.com/en/6.1/topics/settings/

Para la lista completa de settings y sus valores, ver:
https://docs.djangoproject.com/en/6.1/ref/settings/
"""

from datetime import timedelta
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Variables de entorno (.env en la raiz de backend/)
# ---------------------------------------------------------------------------
env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['127.0.0.1', 'localhost'])


# Application definition

INSTALLED_APPS = [
    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Terceros
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',

    # Apps del proyecto bITacora
    'accounts',
    'responsables',
    'seguimiento',
    'compras',
    'proyectos',
    'requerimientos',
    'mantenimientos',
    'bitacora',
    'notificaciones',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bitacora_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bitacora_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST', default='127.0.0.1'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Usuario personalizado
AUTH_USER_MODEL = 'accounts.Usuario'


# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = 'es'

TIME_ZONE = 'America/Santiago'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# El build de React (frontend/dist) se sirve bajo /static/app/. El prefijo
# 'app' en la tupla hace que Vite (con base='/static/app/' en build) y
# Django/WhiteNoise queden alineados sin duplicar archivos.
FRONTEND_DIST_DIR = BASE_DIR.parent / 'frontend' / 'dist'
STATICFILES_DIRS = [('app', FRONTEND_DIST_DIR)] if FRONTEND_DIST_DIR.exists() else []

# Media (archivos subidos por usuarios: adjuntos, etc.)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}


# CORS
# https://github.com/adamchainz/django-cors-headers

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])


# Django REST Framework

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}


# Simple JWT
# https://django-rest-framework-simplejwt.readthedocs.io/

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=45),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=12),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# Email
# https://docs.djangoproject.com/en/6.1/topics/email/#topic-email-configuration

# Siempre SMTP real, incluso con DEBUG=True: el envio automatico
# (enviar_recordatorios) ya esta protegido por EMAIL_ENABLED, y el comando
# de diagnostico (probar_email) esta pensado justamente para probar la
# entrega real durante desarrollo, antes de activar ese flag.
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_ENABLED = env.bool('EMAIL_ENABLED', default=False)
EMAIL_HOST = env('EMAIL_HOST', default='')
EMAIL_PORT = env.int('EMAIL_PORT', default=25)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
# Sin esto, un handshake SMTP que se cuelga (tipico de bloqueos silenciosos
# de firewall corporativo) deja el proceso colgado indefinidamente.
EMAIL_TIMEOUT = env.int('EMAIL_TIMEOUT', default=10)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='bitacora@agrosuper.com')
# Si esta definido, redirige TODOS los correos de prueba a esta casilla en vez
# de a los responsables reales (usado por la app notificaciones).
EMAIL_DEV_REDIRECT_TO = env('EMAIL_DEV_REDIRECT_TO', default='')


# URL publica de la app (para armar links absolutos en los correos). En
# esta PC de desarrollo es localhost:5012; en la PC servidor real debe ser
# su IP/hostname, ej. http://192.168.22.220:5012
SITE_URL = env('SITE_URL', default='http://localhost:5012')

# Configuracion propia de bITacora

# Dias antes del plazo maximo en que el semaforo de un item pasa a amarillo.
DIAS_ALERTA_AMARILLO = env.int('DIAS_ALERTA_AMARILLO', default=3)

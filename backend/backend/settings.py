import os
from pathlib import Path
import dj_database_url
from datetime import timedelta

# Paths base
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-CHANGE_ME!")
DEBUG = True
ALLOWED_HOSTS = ["*"]

# Application definition
INSTALLED_APPS = [
    # Django built-ins
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Terceros
    "corsheaders",
    "rest_framework",
    "django_vite",

    # Aplicaciones locales
    "api",
]

CORS_ALLOW_ALL_ORIGINS = True

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Database
DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}

# REST Framework & JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Static and Media files
STATIC_URL = "/static/"

STATIC_ROOT = os.path.join(BASE_DIR, "backend/frontend/static")

# Define MEDIA_URL to avoid collision with STATIC_URL
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Configuración de django-vite
django_vite_build = {
    "dev_mode": True,
    "dev_server_protocol": "http",
    "dev_server_host": "localhost",
    "dev_server_port": 5173,
    # sin static_url_prefix para usar rutas raíz de Vite
}
DJANGO_VITE = {"default": django_vite_build}

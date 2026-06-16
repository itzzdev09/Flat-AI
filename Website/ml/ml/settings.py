
import os
from pathlib import Path

# Project paths are built inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings are kept here for local use.
# The production checklist is documented at https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: the secret key used in production remains secret.
SECRET_KEY = 'django-insecure-@257x$$hqhwc^blgs*hqbb%s$hkbc@&)jt%!-$kepf5m)3v$5w'

# SECURITY WARNING: debug mode stays off in production.
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() == 'true'


# ALLOWED_HOSTS defaults to an empty list here.
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver', 'abharole.in']


# Application definition

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'prediction',
    'Recommendation',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ml.urls'

# Django's dev server expects a static URL even when this app mostly serves APIs.
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'ml.wsgi.application'


# Database
# Django stores its local ML data in a SQLite file beside this settings module.
# The file is created automatically on first migrate/run if it does not already exist.
DJANGO_SQLITE_PATH = Path(os.environ.get('DJANGO_SQLITE_PATH', BASE_DIR / 'db.sqlite3'))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': DJANGO_SQLITE_PATH,
    }
}


# Internationalization
# The i18n reference is documented at https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True





# Default primary key field type
# The default-auto-field reference is documented at https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



CORS_ALLOW_ALL_ORIGINS = True

"""
Django settings for proxy_pjt project.
"""
from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv()

MODEL_SERVER_URL = os.getenv("MODEL_SERVER_URL")

SECRET_KEY = 'django-insecure-dd2!4+a6)y-d^^t@3ls^rgh-ewuskah%zviz97(exono0tf+*a'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'corsheaders',
    'proxies',
    'rest_framework',
    'django.contrib.auth',
    'django.contrib.contenttypes',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'proxy_pjt.urls'
TEMPLATES = []
WSGI_APPLICATION = 'proxy_pjt.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

CORS_ALLOW_ALL_ORIGINS = True

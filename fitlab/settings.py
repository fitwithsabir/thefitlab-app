"""Settings for The Fit Lab's Python (Django) server.

Stage 1 of the move to Python: the server serves the pages and files in fitlab-v7-website exactly
as Cloudflare does today — clean addresses (/jobs for jobs.html), the short links in _redirects and
the headers in _headers. Supabase stays the database, sign-in and file storage.

Everything that changes between your computer and Render comes from environment variables:
    DEBUG=1                 local development (auto-reloads files, shows errors)
    SECRET_KEY              Render generates it (render.yaml)
    ALLOWED_HOSTS           extra host names, comma separated
    RENDER_EXTERNAL_HOSTNAME  set by Render (…onrender.com)
"""
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

# The site's pages and files. Cloudflare publishes the same folder until thefitlab.in moves here.
SITE_DIR = BASE_DIR / 'fitlab-v7-website'


def env_flag(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


DEBUG = env_flag('DEBUG')

SECRET_KEY = os.environ.get('SECRET_KEY', '')
if not SECRET_KEY:
    if os.environ.get('RENDER'):
        raise ImproperlyConfigured('SECRET_KEY is missing. render.yaml generates one; check the service environment.')
    SECRET_KEY = 'dev-only-not-a-secret-change-me-before-anything-real-uses-it'

ALLOWED_HOSTS = ['thefitlab.in', 'www.thefitlab.in', 'localhost', '127.0.0.1', '[::1]']
ALLOWED_HOSTS += [h.strip() for h in os.environ.get('ALLOWED_HOSTS', '').split(',') if h.strip()]
if os.environ.get('RENDER_EXTERNAL_HOSTNAME'):
    ALLOWED_HOSTS.append(os.environ['RENDER_EXTERNAL_HOSTNAME'])

INSTALLED_APPS = [
    # Lets WhiteNoise serve files in `runserver` the same way it does on Render
    'whitenoise.runserver_nostatic',
    'web.apps.SiteStaticFilesConfig',  # django.contrib.staticfiles, tuned for this site
    'web',
]

MIDDLEWARE = [
    # Outermost: health check, host check, then the _headers rules on every response
    'web.middleware.SiteHeadersMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Scripts, styles, images, i18n packs, sw.js… (compressed copies made at build time)
    'web.middleware.SiteFilesMiddleware',
    # Pages: compress, then answer "not changed" (304) when the browser already has the page
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.http.ConditionalGetMiddleware',
]

ROOT_URLCONF = 'fitlab.urls'
WSGI_APPLICATION = 'fitlab.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {'context_processors': ['django.template.context_processors.request']},
    },
]

# No database yet: Supabase holds the data. (Stage 4 talks to it over its API.)
DATABASES = {}

LANGUAGE_CODE = 'en'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = False
USE_TZ = True

# /jobs, never /jobs/ (old /jobs/ and /jobs.html links are sent to /jobs, as on Cloudflare)
APPEND_SLASH = False

# ---- Files --------------------------------------------------------------------------------------
# Files keep the addresses they have today (/assets/app.js, /i18n/hi.json, /sw.js…), so they are
# served from the root. Pages (*.html) and the host's own config files are left out (apps.py).
STATIC_URL = '/'
# Not used (uploads go to Supabase storage); Django only needs it to differ from STATIC_URL.
MEDIA_URL = '/_media/'
STATICFILES_DIRS = [SITE_DIR]
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    # Keeps file names as they are (pages already ask for ?v=<hash>, tools/stamp_assets.py) and
    # stores gzip and brotli copies next to each file at build time.
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'},
}
WHITENOISE_MAX_AGE = None          # Cache-Control comes from _headers (web.middleware)
WHITENOISE_ALLOW_ALL_ORIGINS = False  # only /.well-known/assetlinks.json allows other sites (_headers)
WHITENOISE_MIMETYPES = {
    '.webmanifest': 'application/manifest+json',
    '.js': 'text/javascript',
    '.xml': 'application/xml',
}

# ---- Security -----------------------------------------------------------------------------------
# Render ends HTTPS and passes the request on; this header says it came in over HTTPS.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = env_flag('SECURE_SSL_REDIRECT')
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
# Razorpay's checkout opens payment windows (netbanking, wallets) that need window.opener, so the
# opener policy stays off, as it is on Cloudflare today.
SECURE_CROSS_ORIGIN_OPENER_POLICY = None

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'loggers': {
        # Server errors (with the traceback) go to Render's log
        'django.request': {'handlers': ['console'], 'level': 'ERROR', 'propagate': False},
    },
}

from django.urls import re_path

from web import views

# Files (scripts, styles, images, i18n packs, sw.js, manifest…) are served before this point by
# web.middleware.SiteFilesMiddleware. Everything else is a page, a short link or a 404.
urlpatterns = [
    re_path(r'^(?P<path>.*)$', views.site, name='site'),
]

handler404 = 'web.views.not_found'

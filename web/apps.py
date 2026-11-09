from django.apps import AppConfig
from django.contrib.staticfiles.apps import StaticFilesConfig


class WebConfig(AppConfig):
    default = True
    name = 'web'
    verbose_name = 'The Fit Lab website'


class SiteStaticFilesConfig(StaticFilesConfig):
    """collectstatic copies the site's files, but not its pages or the host's config files.

    Django's default ignore list skips every name starting with a dot, which would drop
    /.well-known/assetlinks.json (the Android app link), so the list is spelled out here.
    """
    default = False
    ignore_patterns = [
        'CVS', '*~', '.DS_Store', '.git', '.gitignore',
        '*.html',            # pages are served by web.views at clean addresses
        '_headers', '_redirects', 'README.md',
    ]

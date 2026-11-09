import re

from django.http import HttpResponse
from whitenoise.middleware import WhiteNoiseMiddleware

from . import rules

# What browsers get when no _headers rule sets Cache-Control (the same as Cloudflare): keep a copy,
# but check with the server before using it.
DEFAULT_CACHE_CONTROL = 'public, max-age=0, must-revalidate'

HEALTH_PATH = '/healthz'


class SiteHeadersMiddleware:
    """Health check, host check, and the _headers rules on every response (pages and files)."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path_info == HEALTH_PATH:
            # Render checks this from inside its network, under its own host name, so it is
            # answered before the host check.
            response = HttpResponse('ok', content_type='text/plain')
            response['Cache-Control'] = 'no-store'
            return response

        # Refuses requests for host names this site doesn't answer to (400 Bad Request)
        request.get_host()

        response = self.get_response(request)
        add, remove = rules.headers_for(request.path_info)
        for name in remove:
            if name in response:
                del response[name]
        for name, value in add.items():
            response[name] = value
        if (200 <= response.status_code < 300 or response.status_code == 304) and 'Cache-Control' not in response:
            response['Cache-Control'] = DEFAULT_CACHE_CONTROL
        return response


# Never served as files: pages are served at clean addresses by web.views (/jobs, not /jobs.html),
# and these belong to the host, not the site.
NOT_FILES = re.compile(r'\.html$|^/(?:_headers|_redirects|README\.md)$', re.IGNORECASE)


class SiteFilesMiddleware(WhiteNoiseMiddleware):
    """WhiteNoise, serving the site's files at the addresses they have today."""

    def __call__(self, request):
        if NOT_FILES.search(request.path_info):
            return self.get_response(request)
        return super().__call__(request)

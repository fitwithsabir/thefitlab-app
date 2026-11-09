"""Pages at clean addresses, as on Cloudflare today.

    /              index.html
    /jobs          jobs.html
    /jobs.html     → 307 to /jobs   (old links; the query string is kept)
    /jobs/         → 307 to /jobs
    /index(.html)  → 307 to /
    /certify       academy.html, the address bar keeps /certify (_redirects)
    anything else  404
"""
from functools import lru_cache
from pathlib import Path

from django.conf import settings
from django.http import Http404, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_safe

from . import rules


class TemporaryRedirect(HttpResponse):
    """307: like Cloudflare, so a browser that was sending a form keeps sending it."""
    status_code = 307

    def __init__(self, location):
        super().__init__()
        self['Location'] = location


def _with_query(request, location):
    query = request.META.get('QUERY_STRING', '')
    if query and '?' not in location:
        return f'{location}?{query}'
    return location


@lru_cache(maxsize=1)
def _pages_cached(stamp):
    return frozenset(p.stem for p in Path(settings.SITE_DIR).glob('*.html'))


def pages():
    """Names of the site's pages (jobs for jobs.html). Re-listed on every request while developing."""
    if settings.DEBUG:
        return frozenset(p.stem for p in Path(settings.SITE_DIR).glob('*.html'))
    return _pages_cached(0)


def page_file(name):
    return Path(settings.SITE_DIR) / f'{name}.html'


def serve_page(name):
    response = HttpResponse(page_file(name).read_bytes(), content_type='text/html; charset=utf-8')
    return response


@require_safe
def site(request, path):
    url = '/' + path

    # Short links and moved addresses (_redirects)
    found = rules.find_redirect(url)
    if found:
        target, status = found
        if status == 200:
            url = target  # serve that page here, the address bar keeps the short link
        else:
            response = TemporaryRedirect(_with_query(request, target))
            response.status_code = status
            return response

    known = pages()
    name = url.lstrip('/')

    if name in ('index', 'index.html'):
        return TemporaryRedirect(_with_query(request, '/'))
    if name == '':
        return serve_page('index')

    if name.endswith('/'):
        bare = name.rstrip('/')
        if bare in known or bare.removesuffix('.html') in known:
            target = '/' if bare.removesuffix('.html') == 'index' else '/' + bare.removesuffix('.html')
            return TemporaryRedirect(_with_query(request, target))
        raise Http404

    if name.endswith('.html') and name[:-5] in known:
        return TemporaryRedirect(_with_query(request, '/' + name[:-5]))

    if name in known:
        return serve_page(name)

    raise Http404


NOT_FOUND_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found · The Fit Lab</title>
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#fff;color:#111}
@media (prefers-color-scheme:dark){body{background:#0f1115;color:#eee}a{color:#7cc4ff}}main{padding:24px;text-align:center}</style>
</head><body><main><h1>This page isn't here</h1><p><a href="/">Go to The Fit Lab</a></p></main></body></html>
"""


def not_found(request, exception=None):
    return HttpResponseNotFound(NOT_FOUND_PAGE)

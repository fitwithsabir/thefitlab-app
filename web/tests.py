"""Checks that the Python server answers exactly as Cloudflare does today.

Run them with:  python manage.py test
"""
import shutil
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.test import SimpleTestCase, override_settings

from . import rules, views

SITE = Path(settings.SITE_DIR)
PAGES = sorted(p.stem for p in SITE.glob('*.html'))
SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
}
ASSET_CACHE = 'public, max-age=86400, stale-while-revalidate=604800'


class BuiltSiteTestCase(SimpleTestCase):
    """Runs collectstatic into a throwaway folder first, the way the Render build does."""

    @classmethod
    def setUpClass(cls):
        cls._static_root = tempfile.mkdtemp(prefix='fitlab-static-')
        cls._override = override_settings(STATIC_ROOT=cls._static_root, DEBUG=False)
        cls._override.enable()
        call_command('collectstatic', interactive=False, verbosity=0)
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._override.disable()
        shutil.rmtree(cls._static_root, ignore_errors=True)


class PageTests(BuiltSiteTestCase):
    def test_site_has_pages(self):
        self.assertIn('index', PAGES)
        self.assertGreater(len(PAGES), 40)

    def test_every_page_at_its_clean_address(self):
        for name in PAGES:
            url = '/' if name == 'index' else f'/{name}'
            with self.subTest(url=url):
                r = self.client.get(url)
                self.assertEqual(r.status_code, 200)
                self.assertEqual(r.content, (SITE / f'{name}.html').read_bytes())
                self.assertTrue(r['Content-Type'].startswith('text/html'))
                self.assertEqual(r['Cache-Control'], 'public, max-age=0, must-revalidate'
                                 if name != 'offline' else 'no-cache')
                for header, value in SECURITY_HEADERS.items():
                    self.assertEqual(r[header], value)
                self.assertIn('payment=(self "https://api.razorpay.com"', r['Permissions-Policy'])
                self.assertNotIn('Cross-Origin-Opener-Policy', r)

    def test_old_html_links_move_to_clean_address(self):
        r = self.client.get('/profile.html?u=abc&x=1')
        self.assertEqual(r.status_code, 307)
        self.assertEqual(r['Location'], '/profile?u=abc&x=1')
        self.assertEqual(r['X-Frame-Options'], 'DENY')

    def test_trailing_slash_moves_to_clean_address(self):
        r = self.client.get('/about/')
        self.assertEqual((r.status_code, r['Location']), (307, '/about'))

    def test_index_moves_to_root(self):
        for url in ('/index', '/index.html', '/index/'):
            with self.subTest(url=url):
                r = self.client.get(url)
                self.assertEqual((r.status_code, r['Location']), (307, '/'))
        r = self.client.get('/index.html?ref=app')
        self.assertEqual(r['Location'], '/?ref=app')

    def test_short_links_serve_their_page(self):
        expected = {
            '/certify': 'academy',
            '/trainer-jobs': 'work', '/coach-jobs': 'work', '/nutritionist-jobs': 'work',
            '/hire-trainers': 'recruit', '/hire-coaches': 'recruit', '/hire-nutritionists': 'recruit',
        }
        for url, page in expected.items():
            with self.subTest(url=url):
                r = self.client.get(url + '?utm_source=test')
                self.assertEqual(r.status_code, 200)
                self.assertEqual(r.content, (SITE / f'{page}.html').read_bytes())

    def test_missing_pages_are_404(self):
        for url in ('/nope', '/assets/', '/i18n/', '/nope.html', '/_headers', '/_redirects', '/README.md',
                    '/../wrangler.jsonc', '/fitlab/settings.py'):
            with self.subTest(url=url):
                r = self.client.get(url)
                self.assertEqual(r.status_code, 404)
                self.assertEqual(r['X-Frame-Options'], 'DENY')

    def test_pages_only_answer_get_and_head(self):
        self.assertEqual(self.client.head('/about').status_code, 200)
        self.assertEqual(self.client.post('/about').status_code, 405)

    def test_unchanged_page_is_304(self):
        r = self.client.get('/about')
        r2 = self.client.get('/about', HTTP_IF_NONE_MATCH=r['ETag'])
        self.assertEqual(r2.status_code, 304)

    def test_pages_are_compressed(self):
        r = self.client.get('/feed', HTTP_ACCEPT_ENCODING='gzip')
        self.assertEqual(r['Content-Encoding'], 'gzip')

    def test_unknown_host_is_refused(self):
        r = self.client.get('/about', HTTP_HOST='evil.example')
        self.assertEqual(r.status_code, 400)

    def test_health_check(self):
        r = self.client.get('/healthz', HTTP_HOST='10.0.0.7:10000')
        self.assertEqual((r.status_code, r.content), (200, b'ok'))


class FileTests(BuiltSiteTestCase):
    def test_scripts_and_styles_kept_a_day(self):
        for url, ctype in (('/assets/app.js', 'text/javascript'), ('/assets/styles.css', 'text/css'),
                           ('/config.js', 'text/javascript'), ('/assets/logo.png', 'image/png')):
            with self.subTest(url=url):
                r = self.client.get(url)
                self.assertEqual(r.status_code, 200)
                self.assertTrue(r['Content-Type'].startswith(ctype), r['Content-Type'])
                self.assertEqual(r['Cache-Control'], ASSET_CACHE)
                self.assertEqual(r['X-Frame-Options'], 'DENY')
                self.assertNotIn('Access-Control-Allow-Origin', r)

    def test_stamped_address_works(self):
        r = self.client.get('/assets/app.js?v=0123456789')
        self.assertEqual(r.status_code, 200)

    def test_service_worker_always_checked(self):
        r = self.client.get('/sw.js')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Cache-Control'], 'no-cache')

    def test_manifest_type(self):
        r = self.client.get('/manifest.webmanifest')
        self.assertEqual(r['Content-Type'], 'application/manifest+json')

    def test_android_app_link(self):
        r = self.client.get('/.well-known/assetlinks.json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Content-Type'], 'application/json')
        self.assertEqual(r['Access-Control-Allow-Origin'], '*')

    def test_translation_packs_compressed(self):
        for lang in ('hi', 'te'):
            with self.subTest(lang=lang):
                r = self.client.get(f'/i18n/{lang}.json', HTTP_ACCEPT_ENCODING='br, gzip')
                self.assertEqual(r.status_code, 200)
                self.assertEqual(r['Content-Encoding'], 'br')
                self.assertEqual(r['Cache-Control'], 'public, max-age=0, must-revalidate')

    def test_unchanged_file_is_304(self):
        r = self.client.get('/assets/app.js')
        r2 = self.client.get('/assets/app.js', HTTP_IF_NONE_MATCH=r['ETag'])
        self.assertEqual(r2.status_code, 304)

    def test_robots_and_sitemap(self):
        for url in ('/robots.txt', '/sitemap.xml'):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)

    def test_pages_are_not_files(self):
        root = Path(settings.STATIC_ROOT)
        self.assertFalse(list(root.rglob('*.html')))
        self.assertFalse((root / '_headers').exists())
        self.assertTrue((root / '.well-known' / 'assetlinks.json').exists())

    def test_every_file_the_pages_load_exists(self):
        import re
        ref = re.compile(r'''(?:src|href)=["']((?:assets/|i18n/)[^"'?#]+|config\.js)''')
        missing = set()
        for name in PAGES:
            for path in ref.findall((SITE / f'{name}.html').read_text(encoding='utf-8')):
                if self.client.get('/' + path).status_code != 200:
                    missing.add(path)
        self.assertFalse(missing)


class RuleTests(SimpleTestCase):
    def test_redirect_parser(self):
        parsed = rules.parse_redirects('# c\n/a  /b  200\n/old/*  /new/:splat  301\n/x /y\n')
        self.assertEqual([(r.source, r.target, r.status) for r in parsed],
                         [('/a', '/b', 200), ('/old/*', '/new/:splat', 301), ('/x', '/y', 302)])
        self.assertEqual(parsed[1].match('/old/p/q'), '/new/p/q')
        self.assertIsNone(parsed[0].match('/ab'))

    def test_header_parser(self):
        parsed = rules.parse_headers('/*\n  A: 1\n/x/*\n  A: 2\n  B: 3\n/x/y\n  ! B\n')
        self.assertEqual([(r.path, r.set, r.remove) for r in parsed],
                         [('/*', [('A', '1')], []), ('/x/*', [('A', '2'), ('B', '3')], []), ('/x/y', [], ['B'])])

    def test_headers_merge_like_cloudflare(self):
        from unittest import mock
        parsed = rules.parse_headers('/*\n  A: 1\n/x/*\n  A: 2\n  B: 3\n/x/y\n  ! B\n')
        with mock.patch.object(rules, 'header_rules', return_value=parsed):
            self.assertEqual(rules.headers_for('/x/z'), ({'A': '1, 2', 'B': '3'}, set()))
            self.assertEqual(rules.headers_for('/x/y'), ({'A': '1, 2'}, {'b'}))
            self.assertEqual(rules.headers_for('/q'), ({'A': '1'}, set()))

    def test_site_rules_load(self):
        self.assertEqual(rules.find_redirect('/certify'), ('/academy', 200))
        self.assertIsNone(rules.find_redirect('/academy'))
        add, _ = rules.headers_for('/assets/app.js')
        self.assertEqual(add['Cache-Control'], ASSET_CACHE)
        self.assertIn('index', views.pages())

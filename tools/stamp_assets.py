#!/usr/bin/env python3
"""Stamp the site's own scripts and stylesheets with a content version (?v=…).

Browsers keep /assets/* for a day (see fitlab-v7-website/_headers), so a page must ask for a
changed file under a new address. Run this before every commit that touches assets:

    python3 tools/stamp_assets.py

It rewrites src="assets/x.js", href="assets/x.css" and src="config.js" in every page (and the
dynamic 'assets/ask.js' load in app.js) to end in ?v=<first 10 hex of the file's SHA-1>.
Running it twice changes nothing.
"""
import hashlib, pathlib, re

SITE = pathlib.Path(__file__).resolve().parent.parent / 'fitlab-v7-website'
REF = re.compile(r'''(?P<q>["'])(?P<path>(?:assets/[\w./-]+\.(?:js|css))|config\.js)(?:\?v=[0-9a-f]+)?(?P=q)''')

def digest(rel):
    f = SITE / rel
    return hashlib.sha1(f.read_bytes()).hexdigest()[:10] if f.is_file() else None

def stamp(text):
    def sub(m):
        h = digest(m.group('path'))
        return m.group(0) if not h else f"{m.group('q')}{m.group('path')}?v={h}{m.group('q')}"
    return REF.sub(sub, text)

def main():
    changed = []
    # 1. scripts that load other scripts: stamp these first, their own hash depends on it
    for rel in ['assets/app.js']:
        f = SITE / rel
        s = f.read_text(encoding='utf-8')
        # only the dynamic loader lines (s.src = 'assets/…'); leave other strings alone
        t = re.sub(r"(\.src\s*=\s*)(['\"])(assets/[\w./-]+\.js)(?:\?v=[0-9a-f]+)?\2",
                   lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}?v={digest(m.group(3))}{m.group(2)}" if digest(m.group(3)) else m.group(0), s)
        if t != s: f.write_text(t, encoding='utf-8'); changed.append(rel)
    # 1b. scripts loaded on demand with FL.loadScript('assets/…') in pages and scripts
    LOADER = re.compile(r"(loadScript\(\s*)(['\"])(assets/[\w./-]+\.js)(?:\?v=[0-9a-f]+)?\2")
    for f in sorted(list(SITE.glob('*.html')) + list((SITE / 'assets').glob('*.js'))):
        s = f.read_text(encoding='utf-8')
        t = LOADER.sub(lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}?v={digest(m.group(3))}{m.group(2)}" if digest(m.group(3)) else m.group(0), s)
        if t != s: f.write_text(t, encoding='utf-8'); changed.append(f.name)
    # 2. every page: <script src> and <link href> to our own files
    for f in sorted(SITE.glob('*.html')):
        s = f.read_text(encoding='utf-8')
        t = re.sub(r'<(script|link)\b[^>]*>', lambda m: stamp(m.group(0)), s)
        if t != s: f.write_text(t, encoding='utf-8'); changed.append(f.name)
    print(f'stamped {len(changed)} file(s)' + (': ' + ', '.join(changed) if changed else ''))

if __name__ == '__main__':
    main()

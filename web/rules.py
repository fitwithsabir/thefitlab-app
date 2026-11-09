"""Reads the site's _redirects and _headers files, so this server and Cloudflare follow the same rules.

Both files use Cloudflare's format:

_redirects — one rule per line:  /from  /to  [status]
    status 200 serves /to while the address bar keeps /from (a short link); 301/302/307/308
    send the browser to /to. A * in /from matches anything and is passed on as :splat.

_headers — a path line, then indented "Name: value" lines for responses at that path.
    A * in the path matches anything. When several rules set the same header, the values are
    joined with ", " (as Cloudflare does). "! Name" removes a header set by an earlier rule.
"""
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from django.conf import settings


def _pattern(path):
    """Cloudflare path pattern → compiled regex (* = anything, :name = one path segment)."""
    out, i = [], 0
    for m in re.finditer(r'\*|:([A-Za-z]\w*)', path):
        out.append(re.escape(path[i:m.start()]))
        out.append('(?P<splat>.*)' if m.group(0) == '*' else f'(?P<{m.group(1)}>[^/]+)')
        i = m.end()
    out.append(re.escape(path[i:]))
    return re.compile(''.join(out))


@dataclass
class Redirect:
    source: str
    target: str
    status: int
    regex: re.Pattern = field(repr=False, default=None)

    def match(self, path):
        m = self.regex.fullmatch(path)
        if not m:
            return None
        target = self.target
        for name, value in m.groupdict().items():
            target = target.replace(f':{name}', value or '')
        return target


@dataclass
class HeaderRule:
    path: str
    set: list           # [(name, value)]
    remove: list        # [name]
    regex: re.Pattern = field(repr=False, default=None)


def _lines(text):
    for raw in text.splitlines():
        if not raw.strip() or raw.lstrip().startswith('#'):
            continue
        yield raw


def parse_redirects(text):
    rules = []
    for raw in _lines(text):
        parts = raw.split()
        if len(parts) < 2:
            continue
        status = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 302
        rules.append(Redirect(parts[0], parts[1], status, _pattern(parts[0])))
    return rules


def parse_headers(text):
    rules, current = [], None
    for raw in _lines(text):
        if not raw[0].isspace():
            current = HeaderRule(raw.strip(), [], [], _pattern(raw.strip()))
            rules.append(current)
            continue
        if current is None:
            continue
        line = raw.strip()
        if line.startswith('!'):
            current.remove.append(line[1:].strip())
            continue
        name, sep, value = line.partition(':')
        if sep:
            current.set.append((name.strip(), value.strip()))
    return rules


def _read(name):
    f = Path(settings.SITE_DIR) / name
    return f.read_text(encoding='utf-8') if f.is_file() else ''


@lru_cache(maxsize=1)
def _cached(stamp):
    return parse_redirects(_read('_redirects')), parse_headers(_read('_headers'))


def _stamp():
    """Re-read the files when they change while developing; read them once on Render."""
    if not settings.DEBUG:
        return 0
    site = Path(settings.SITE_DIR)
    return tuple((site / n).stat().st_mtime if (site / n).exists() else 0 for n in ('_redirects', '_headers'))


def redirects():
    return _cached(_stamp())[0]


def header_rules():
    return _cached(_stamp())[1]


def find_redirect(path):
    """First matching rule for this path: (target, status), or None."""
    for rule in redirects():
        target = rule.match(path)
        if target is not None:
            return target, rule.status
    return None


def headers_for(path):
    """Headers the _headers rules give this path, in order: ({name: value}, {removed names})."""
    out, names, removed = {}, {}, set()
    for rule in header_rules():
        if not rule.regex.fullmatch(path):
            continue
        for name in rule.remove:
            key = name.lower()
            removed.add(key)
            out.pop(names.pop(key, name), None)
        for name, value in rule.set:
            key = name.lower()
            removed.discard(key)
            if key in names:
                out[names[key]] = f'{out[names[key]]}, {value}'
            else:
                names[key] = name
                out[name] = value
    return out, removed

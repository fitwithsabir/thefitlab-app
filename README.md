# The Fit Lab — thefitlab.in

The site is moving to Python (Django), step by step, while it stays live.

| Folder / file | What it is |
| --- | --- |
| `fitlab-v7-website/` | The pages and files people see (HTML, scripts, styles, i18n packs). Cloudflare publishes this folder today. |
| `fitlab/`, `web/`, `manage.py` | The Python server. It serves the same pages at the same addresses: clean URLs, the short links in `_redirects` and the headers in `_headers`. |
| `render.yaml`, `requirements.txt` | How Render builds and runs the Python server. |
| `tools/stamp_assets.py` | Run before committing changes to scripts or styles (gives them a new `?v=` address). |

Supabase (project `izdsqmghkawvdvcolajv`) stays the database, sign-in and file storage.

## Run the Python server on your computer

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
DEBUG=1 python manage.py runserver        # http://localhost:8000
python manage.py test                     # checks every page, file, redirect and header
```

## Stages

1. **Python serves today's pages** (done): Django + WhiteNoise on Render, same addresses and headers as Cloudflare.
2. Shared page parts (head, header, scripts) become Django templates.
3. Calculators and health tools move to Python modules with tests and a JSON API.
4. Server functions (email, Ask chat, Coach AI, licence review, translations, payments) move from Supabase Edge Functions to Django.
5. PDFs made on the server (so Hindi and Telugu PDFs become possible).

thefitlab.in moves from the Cloudflare Worker to Render once the Render address has been checked.

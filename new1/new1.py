"""
FinShield AI — new1.py
======================
Redesigned shell for the FinShield AI dashboard.

    python new1/new1.py          →  http://localhost:5000

It changes NOTHING in dashboard/. It imports dashboard/new.py (which itself
imports dashboard/app.py), so every page, API and loader keeps working from
its own files. new1.py only wraps the page that is served and adds:

  • new1.html  — the new design: fintech logo, glass header with four main
                 tabs (Overview · User Portal · Investigation Workbench ·
                 Live Prediction), notebook sub-tabs, command palette styles
  • new1.js    — the new navigation: main tabs + sliding indicator, notebook
                 sub-tabs 01–10 under Overview, ⌘K / Ctrl+K command palette,
                 keyboard shortcuts, deep links (#/workbench …), prev/next
                 pager on notebook pages, count-up stats
  • logo.svg   — the FinShield AI logo (also the favicon)

Files (all in new1/):
  new1.py · new1.html · new1.js · logo.svg

Deploy:  gunicorn --chdir new1 new1:app --workers 1 --threads 4 --timeout 180
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DASHBOARD = os.path.join(ROOT, 'dashboard')
if DASHBOARD not in sys.path:
    sys.path.insert(0, DASHBOARD)

from flask import Response, send_from_directory  # noqa: E402

import new as ext  # noqa: E402  — dashboard/new.py (imports dashboard/app.py)

app = ext.app

NEW1_HTML = os.path.join(HERE, 'new1.html')
NEW1_JS = os.path.join(HERE, 'new1.js')
LOGO = os.path.join(HERE, 'logo.svg')


def _sections():
    """new1.html holds two marked sections: STYLE (goes in <head>) and
    SHELL (goes at the end of <body>, before new1.js)."""
    out = {'STYLE': '', 'SHELL': ''}
    try:
        with open(NEW1_HTML, encoding='utf-8') as fh:
            text = fh.read()
    except OSError:
        return out
    for key in out:
        m = re.search(rf'<!--\s*NEW1:{key}\s*-->(.*?)<!--\s*/NEW1:{key}\s*-->', text, re.S)
        if m:
            out[key] = m.group(1)
    return out


def _inject(html):
    if 'id="fs1-shell"' in html or not os.path.isfile(NEW1_HTML):
        return html
    parts = _sections()
    head = ('<link rel="icon" type="image/svg+xml" href="/new1/logo.svg">\n'
            '<meta name="theme-color" content="#050B16">\n' + parts['STYLE'])
    html = html.replace('</head>', head + '\n</head>', 1)
    tail = parts['SHELL'] + '\n<script src="/new1.js"></script>\n'
    k = html.rfind('</body>')
    return html[:k] + tail + html[k:] if k >= 0 else html + tail


_prev_index = app.view_functions['index']   # new.py's index (already adds its tabs)


def index_new1():
    resp = _prev_index()
    if isinstance(resp, tuple) or getattr(resp, 'mimetype', '') != 'text/html':
        return resp
    resp.set_data(_inject(resp.get_data(as_text=True)))
    resp.headers['Cache-Control'] = 'no-store, must-revalidate'
    return resp


app.view_functions['index'] = index_new1


@app.route('/new1.js')
def serve_new1_js():
    resp = send_from_directory(HERE, 'new1.js', mimetype='application/javascript')
    resp.headers['Cache-Control'] = 'no-store'
    return resp


@app.route('/new1/logo.svg')
def serve_new1_logo():
    if not os.path.isfile(LOGO):
        return Response('', status=404)
    resp = send_from_directory(HERE, 'logo.svg', mimetype='image/svg+xml')
    resp.headers['Cache-Control'] = 'max-age=3600'
    return resp


def _check():
    parts = _sections()
    missing = [k for k, v in parts.items() if not v.strip()]
    if missing:
        print(f"  ✗ new1.html is missing its NEW1:{'/NEW1:'.join(missing)} section(s) — "
              "the redesign will not be applied")
    else:
        print('  ✓ new1 design ready — main tabs: Overview · User Portal · '
              'Investigation Workbench · Live Prediction')


_check()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\nFinShield AI (new1 design) → http://localhost:{port}")
    print('  ⌘K / Ctrl+K: command palette · Alt+1…4: main tabs · [ ]: previous / next notebook\n')
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)

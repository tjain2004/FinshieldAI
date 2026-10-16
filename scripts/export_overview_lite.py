"""Export the Overview index as memory-mappable .npy files ("overview lite").

The Overview page's Transaction Overview search and Linked Account Network
read data/precomputed/transactions_overview.parquet (5,078,336 rows).
Loading that parquet takes ~800 MB of RAM at startup, which crashes a
512 MB server (Render free plan).

This script writes the same columns as plain .npy files, plus the two
account indexes pre-sorted. new1/overview_lite.py opens them with
numpy memory-mapping, so the server reads only the rows a request needs
and the app starts in a few MB instead of ~800 MB.

Run once on your own computer, from the project root:
    python scripts/export_overview_lite.py

Writes data/precomputed/overview_lite/  (~300 MB, every file < 50 MB,
so it goes to GitHub as normal files — no Git LFS needed).
"""
import json
import os
import sys

import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data', 'precomputed', 'transactions_overview.parquet')
OUT = os.path.join(ROOT, 'data', 'precomputed', 'overview_lite')

if not os.path.isfile(SRC):
    sys.exit(f'Not found: {SRC}\nRun scripts/precompute_transactions.py first.')

print(f'reading {SRC} ...')
t = pd.read_parquet(SRC)
os.makedirs(OUT, exist_ok=True)

columns = {}
for c in t.columns:
    if c == 'risk_level':
        continue
    arr = t[c].to_numpy()
    if arr.dtype == object:
        sys.exit(f'column {c} is not numeric — unexpected parquet layout')
    np.save(os.path.join(OUT, f'{c}.npy'), np.ascontiguousarray(arr))
    columns[c] = str(arr.dtype)
    print(f'  {c:<18} {arr.dtype}  {arr.nbytes / 1_048_576:6.1f} MB')

# risk level: categories -> small int codes
lvl = t['risk_level'].astype('category')
levels = [str(x) for x in lvl.cat.categories]
np.save(os.path.join(OUT, 'risk_level_code.npy'), lvl.cat.codes.to_numpy().astype(np.int8))
print(f'  risk_level         int8 codes  {levels}')

# account indexes, pre-sorted (same as app.py builds at startup)
for key in ('sender', 'receiver'):
    ids = t[key].to_numpy()
    order = np.argsort(ids, kind='stable').astype(np.int32)
    np.save(os.path.join(OUT, f'{key}_order.npy'), order)
    np.save(os.path.join(OUT, f'{key}_sorted.npy'), np.ascontiguousarray(ids[order]))
    print(f'  {key} index        sorted')

with open(os.path.join(OUT, 'meta.json'), 'w') as fh:
    json.dump(dict(rows=int(len(t)), columns=columns, risk_levels=levels,
                   source='data/precomputed/transactions_overview.parquet'), fh, indent=1)

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
biggest = max(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(f'\nwrote {OUT}\n  {len(os.listdir(OUT))} files · {total / 1_048_576:.0f} MB total · '
      f'largest file {biggest / 1_048_576:.0f} MB')
print('DONE — now: git add data/precomputed/overview_lite  →  commit  →  push')

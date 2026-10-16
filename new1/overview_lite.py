"""Low-memory loader for the Overview index (used by new1.py).

If dashboard/app.py could not load data/precomputed/transactions_overview.parquet
(for example it was left out of a small server to save memory), this fills
app.py's TXN_OV / TXN_BY lookups from data/precomputed/overview_lite/*.npy
using numpy memory-mapping. The arrays stay on disk; only the rows a request
touches are read, so the Transaction Overview search and the Linked Account
Network work even on a 512 MB server.

Create the files once with:  python scripts/export_overview_lite.py
"""
import json
import os

import numpy as np


class _Levels:
    """Looks like an array of risk-level strings, backed by int8 codes."""

    def __init__(self, codes, names):
        self.codes, self.names = codes, names

    def __len__(self):
        return len(self.codes)

    def __getitem__(self, i):
        c = self.codes[i]
        if np.ndim(c) == 0:
            return self.names[int(c)] if c >= 0 else ''
        return np.array([self.names[int(x)] if x >= 0 else '' for x in c], dtype=object)


def attach(base):
    """base = the imported dashboard/app.py module. Returns a status string."""
    if getattr(base, 'TXN_OV', None):
        return 'parquet already loaded'
    folder = os.path.join(base.DATA, 'precomputed', 'overview_lite')
    meta_path = os.path.join(folder, 'meta.json')
    if not os.path.isfile(meta_path):
        return 'not found (run scripts/export_overview_lite.py)'
    with open(meta_path, encoding='utf-8') as fh:
        meta = json.load(fh)

    def load(name):
        return np.load(os.path.join(folder, name + '.npy'), mmap_mode='r')

    ov = {c: load(c) for c in meta['columns']}
    ov['risk_level'] = _Levels(load('risk_level_code'), meta['risk_levels'])
    by = {k: (load(f'{k}_order'), load(f'{k}_sorted')) for k in ('sender', 'receiver')}

    # fill app.py's own dicts in place — its routes look them up at call time
    base.TXN_OV.clear(); base.TXN_OV.update(ov)
    base.TXN_BY.clear(); base.TXN_BY.update(by)
    return f"memory-mapped ({meta['rows']:,} rows)"

# FinShield AI — Flask Dashboard

A 12-tab web dashboard over your existing FinShield AI notebooks. Every number,
chart and table it shows is read live from the `.csv` / `.pkl` files your
notebooks already saved — nothing is hard-coded except the fixed dataset facts
(5,078,336 transactions, 5,177 fraud) that come straight from Notebook 01's output.

Feature counts shown on the Feature Engineering tab are read directly from the saved
model files: **29 features** for the 7-model comparison (`models/best_ml_model.pkl`)
and **30** for the production XGBoost used by SHAP, the Risk Scoring Engine and live
prediction (`models/xgboost_model.pkl`).

---

## Step-by-step: run it on your computer (Windows)

### Step 1 — Put the files in the right place

Copy the four items from this package into your existing project folder so it
looks like this:

```
C:\Users\tjain\Downloads\FinShieldAI\
├── app.py                  ← NEW (from this package)
├── requirements.txt        ← NEW
├── README.md               ← NEW (this file)
├── templates\
│   └── dashboard.html      ← NEW
├── static\
│   ├── dashboard.js        ← NEW
│   └── chart.umd.min.js    ← NEW
│
├── charts\                 ← you already have these
├── models\                 ← you already have these
├── results\                ← you already have these
├── notebooks\
├── preprocessed\
└── featured\
```

`app.py` must sit at the **top level** of `FinShieldAI`, next to the `charts`,
`models` and `results` folders — that is how it finds your data.

> You can delete the old `template\` folder (with the `app.py` and
> `dashboard.html` inside it). This package replaces it.

### Step 2 — Open a terminal in the project folder

Press `Windows key`, type `cmd`, hit Enter, then paste:

```cmd
cd C:\Users\tjain\Downloads\FinShieldAI
```

### Step 3 — Install Flask

You already have pandas, numpy, scikit-learn, xgboost and shap installed from
running the notebooks. You only need Flask:

```cmd
pip install flask flask-cors
```

If you'd rather install everything the dashboard needs in one go:

```cmd
pip install -r requirements.txt
```

### Step 4 — Start the server

```cmd
python app.py
```

You should see a startup report like this:

```
================================================================
  FinShield AI — starting up...
================================================================

[Models]
  ✓ loaded   models\xgboost_model.pkl
  ✓ loaded   models\shap_explainer.pkl
  ✓ loaded   models\risk_engine_config.pkl
  ✓ loaded   models\best_ml_model_name.pkl
  → live-prediction model expects 30 features

[Results — small/medium CSVs]
  ✓ loaded   results\ml_comparison_results.csv  (7 rows)
  ✓ loaded   results\alerts.csv  (129,124 rows)
  ...

[Charts]
  ✓ 37 chart files found
================================================================

FinShield AI Dashboard → http://localhost:5000
```

Startup takes about 20–40 seconds — it is loading the models and the 129k-row
alerts file.

### Step 5 — Open the dashboard

Go to **http://localhost:5000** in Chrome.

To stop the server, press `Ctrl + C` in the terminal.

---

## The 12 tabs

| # | Tab | Source notebook |
|---|-----|-----------------|
| — | Overview | executive summary across all 11 |
| 01 | Data Cleaning | `Data understanding and cleaning (1).ipynb` |
| 02 | Exploratory Analysis | `Exploratory Data Analysis (2).ipynb` |
| 03 | Feature Engineering | `Feature engineering (1).ipynb` |
| 04 | Preprocessing | `preprocessing (1).ipynb` |
| 05 | ML Model Comparison | `ML models and their comparison (1).ipynb` |
| 06 | CNN Deep Learning | `CNN deep learning (2).ipynb` |
| 07 | LSTM Deep Learning | `LSTM deep learning model.ipynb` |
| 08 | Graph Network Analysis | `Graph Netwok Analysis (2).ipynb` |
| 09 | SHAP Explainability | `SHAP explainibility.ipynb` |
| 10 | Risk Scoring Engine | `Risk_Scoring_Engine.ipynb` |
| 11 | Live Prediction & Alerts | live console over the trained model |

---

## API endpoints

The dashboard is a thin front-end over a JSON API you can also call directly
(useful if you want to build something else on top, or show the API in a viva):

| Endpoint | Returns |
|----------|---------|
| `GET /api/health` | which models/files loaded successfully |
| `GET /api/overview` | headline dataset + pipeline stats |
| `GET /api/ml_comparison` | all 7 models with 11 metrics each |
| `GET /api/xgb_metrics` | production XGBoost metrics |
| `GET /api/cnn_metrics` | CNN-1D metrics |
| `GET /api/cnn_score_distribution` | histogram of 710,679 CNN scores |
| `GET /api/lstm_metrics` | LSTM metrics, recomputed live from saved predictions |
| `GET /api/graph_communities` | top transaction communities + fraud rates |
| `GET /api/shap_importance?n=20` | global SHAP feature importance |
| `GET /api/risk_overview` | ensemble weights, thresholds, capture rate |
| `GET /api/risk_distribution` | transactions + fraud rate per risk level |
| `GET /api/alerts?page=1&level=CRITICAL` | paginated alert queue |
| `GET /api/predict_meta` | what fields the prediction form needs |
| `POST /api/predict` | **live scoring** — percentile score + SHAP factors + SAR narrative |
| `GET /api/predict_thresholds` | the calibrated probability cut-offs per risk tier |
| `GET /api/risk_diagnostics` | ensemble vs XGBoost-alone fraud capture at matched alert budgets |
| `GET /api/inventory` | every model / CSV / chart file discovered, with load status |
| `GET /api/fraud_by_hour` | fraud rate per hour, recomputed from the cleaned dataset |
| `GET /api/class_balance` | class-imbalance figures (rebuilt chart) |
| `GET /api/model_detail?name=...` | full metrics + hyper-parameters for one of the 7 models |
| `GET /charts/<name>.png` | serves your notebook chart images |

### Testing the prediction API from the command line

```cmd
curl -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d "{\"amount_paid\":12500,\"payment_format\":\"ACH\",\"hour\":3,\"is_cross_bank\":true,\"is_high_velocity\":true}"
```

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'flask'`**
Run `pip install flask flask-cors`.

**`Port 5000 is in use`**
Something else is using the port. Open `app.py`, scroll to the last line, and
change `port=5000` to `port=8000`, then open `http://localhost:8000` instead.

**A tab shows "missing" in the startup log**
The dashboard degrades gracefully — a missing file only blanks that one panel.
Check the file is in `models\` or `results\` with the exact name shown in the log.

**The Risk Scoring Engine tab takes a while the first time**
It reads `results\final_risk_scores.csv` (435 MB) to compute the exact risk-level
breakdown. This happens **once** — the result is cached in memory, so every
later visit is instant. If that file isn't present, the tab falls back to
`alerts.csv` plus the calibrated totals in `risk_engine_config.pkl`.

**`python` is not recognised**
Use `py app.py` instead of `python app.py`, or add Python to your PATH.

---

## Notes on the numbers

The dashboard reports your results as they actually are, including the two
models that under-performed:

- **CNN-1D** — AUC-ROC 0.5172 after 5 epochs, caught 1 of 171 fraud sequences.
- **LSTM** — AUC-ROC 0.5099 after 5 epochs. Training loss stayed flat and the
  model collapsed to predicting fraud on every sequence, which is why recall
  reads 100% and precision 0.13%. The confusion matrix on that tab shows it.

### The risk engine has a measurable problem — and the dashboard now proves it

The Risk Scoring Engine tab runs a live diagnostic across all 5.08M scored
transactions. At the current alert budget (2.54%, 129,124 alerts):

| Ranking used | Fraud captured |
|---|---|
| Current ensemble | 199 / 5,177 = **3.84%** |
| XGBoost score alone | 865 / 5,177 = **16.71%** |

Same number of alerts, same analyst workload, **4.35x more fraud caught**. The
cause is that CNN-1D holds 14.7% of the ensemble weight despite a near-random
AUC-ROC of 0.5172 — mixing a random signal into a good ranking shuffles it. The
fix is to rebuild the ensemble in `Risk_Scoring_Engine.ipynb` with CNN and LSTM
at 0% weight.

### Live prediction scoring was fixed

The tiers in `risk_engine_config.pkl` (CRITICAL >= 27.00) live on the *ensemble*
`risk_score_100` scale. The live console was comparing a raw XGBoost probability
x100 against them — a category error, since the model's 99.5th-percentile
probability is only 0.049. Anything above 0.27 came out CRITICAL, so almost
every transaction did.

Live prediction now converts the probability into its **percentile** within the
real distribution of all 5.08M XGBoost scores, then applies the engine's own
top-0.5% / 2.5% / 10% tiers. All four levels are reachable again — a routine
cheque scores LOW, an ACH transfer with high velocity scores CRITICAL.

<div align="center">

<img src="docs/assets/banner.svg" alt="FinShield AI — Anti-Money-Laundering Intelligence Platform" width="100%"/>

<br/>

<img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/XGBoost-AUC_0.973-FF6600?style=for-the-badge"/>
<img src="https://img.shields.io/badge/PyTorch-LSTM_·_CNN--1D-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white"/>
<img src="https://img.shields.io/badge/SHAP-Explainable_AI-8A2BE2?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Flask-Dashboard-000000?style=for-the-badge&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/Cytoscape.js-Graph_UI-F7DF1E?style=for-the-badge"/>

<br/><br/>

**Trace a whole money-laundering ring from one suspicious transaction.**<br/>
FinShield AI scores 5.08 million bank transactions with machine learning, explains each decision with SHAP,<br/>
and maps the linked accounts, **mule chains** and **suspicious hubs** behind every alert.

<br/>

[**The unique part**](#-the-unique-part--follow-the-money) ·
[Features](#-what-you-get) ·
[Screenshots](#-screenshots) ·
[Results](#-results) ·
[Architecture](#-system-architecture) ·
[Pipeline](#-project-pipeline) ·
[User flow](#-user-flow) ·
[Run it](#-getting-started) ·
[Future: Agentic AI](#-future-scope--finshield-agents)

</div>

---

## 🕸️ The unique part — *follow the money*

Most fraud models score each transaction **on its own**, so a payment either passes or it doesn't.
Money laundering doesn't work like that. Money moves through **chains of mule accounts** and gets layered
until it looks clean, and every single hop can look harmless by itself.

FinShield AI is built around the network. **Click one account or transaction and every linked account
appears.** Click any of them and the map re-centres there, so you can walk the ring hop by hop.

<div align="center">

### Overview → Linked Account Network

<img src="docs/assets/linked_network.gif" alt="Clicking through a mule ring in the Linked Account Network" width="88%"/>

<sub>Recorded from the running dashboard on the real dataset. Three clicks walk a laundering ring in community 24: ACC-445736 → 448952 → 845 → 878.</sub>

</div>

<table>
<tr>
<td width="50%" valign="top">

#### What you're looking at
| On the map | Meaning |
|---|---|
| 🔴 **Red node** | account inside a *suspicious community* (graph clustering) |
| 🟠 **Orange ring** | account flagged as a **mule** (fan-in + fan-out pattern) |
| 🟢 **Green / 🔵 blue edge** | money **in** / money **out** |
| **Edge label** | how much moved on that link (+ other currencies) |
| **Click a node** | re-centre the network on that account |

</td>
<td width="50%" valign="top">

#### Why it matters — a real finding
ACC-448952 and ACC-845 have **27 and 9 labelled laundering
transactions**, yet **none** of them crossed the alert threshold
on their own. They're scored LOW or MEDIUM one row at a time.

On the map they light up immediately. 8 of 448952's 10 busiest
counterparties are flagged mules, and the money loops back
(878 → 448952). **The ring is visible in the graph even where the
single-transaction score misses it.**

</td>
</tr>
</table>

<div align="center">

### Investigation Workbench → one transaction, the whole case

<img src="docs/assets/workbench_flow.gif" alt="Investigation Workbench: lookup, SHAP, linked accounts, two hops, re-centre" width="92%"/>

<sub>Look up <code>TX-2132660</code> → <b>Why flagged?</b> (SHAP) → <b>Linked accounts</b> (Cytoscape.js) → two hops → double-click to re-centre. Red links are transactions labelled as laundering.</sub>

</div>

---

## ✨ What you get

<table>
<tr>
<td width="33%" valign="top">

### 🕵️ Investigation Workbench
- Alert queue of **129,124** Risk Engine alerts, with live counts by analyst decision
- Look up any **transaction, alert or account** across all 5.08M rows instantly, using a numpy byte-offset index
- **Linked accounts** map: 1–2 hops, laundering links in red, click for details, double-click to re-centre
- Full **account history** with risk per transaction
- Analyst actions (confirm, escalate, dismiss) saved to an **audit log**
- **Auto-drafted SAR** (Suspicious Activity Report)

</td>
<td width="33%" valign="top">

### 🧑‍💼 User Portal
- **Transaction Composer**: describe a payment in plain terms (amount, method, banks, time). The server builds all **30 model features** from those inputs
- **Risk Verdict**: `APPROVE · REVIEW · HOLD · BLOCK`, a calibrated risk **percentile** against 5.08M real scores, and plain-English **SHAP reasons**
- Six one-click scenarios: salary, card, structuring, layering, crypto cash-out, large wire
- **Link Security**: a phishing-URL checker with red-flag reasons

</td>
<td width="33%" valign="top">

### 📊 Overview + 11 notebook tabs
- Executive summary of the whole pipeline
- **Transaction Overview** search, plus the **Linked Account Network** with mule-account suggestions
- One tab per notebook: cleaning, EDA, feature engineering, preprocessing, 7 ML models, CNN, LSTM, graph, SHAP, risk engine
- **Live Prediction** console with SHAP factors
- Every number is read live from the notebooks' saved outputs, nothing hard-coded

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

#### User Portal — the same model, three different decisions
<img src="docs/assets/portal_screening.gif" alt="User Portal scenarios: APPROVE, HOLD, BLOCK" width="85%"/>

<img src="docs/screenshots/portal_verdicts.png" alt="APPROVE, HOLD and BLOCK verdicts with SHAP reasons" width="100%"/>

</div>

<table>
<tr>
<td width="50%"><b>Investigation Workbench — two-hop money map</b><br/><img src="docs/screenshots/workbench_network.png" alt="Workbench network"/></td>
<td width="50%"><b>Why flagged? — per-transaction SHAP</b><br/><img src="docs/screenshots/workbench_why_flagged.png" alt="Why flagged"/></td>
</tr>
<tr>
<td width="50%"><b>Auto-drafted Suspicious Activity Report</b><br/><img src="docs/screenshots/workbench_sar.png" alt="SAR report"/></td>
<td width="50%"><b>Overview — transaction search + mule suggestions</b><br/><img src="docs/screenshots/overview.png" alt="Overview"/></td>
</tr>
<tr>
<td width="50%"><b>ML Model Comparison — 7 models, one held-out test set</b><br/><img src="docs/screenshots/ml_model_comparison.png" alt="ML model comparison"/></td>
<td width="50%"><b>Exploratory Data Analysis</b><br/><img src="docs/screenshots/exploratory_analysis.png" alt="EDA"/></td>
</tr>
<tr>
<td colspan="2"><b>Graph Network Analysis — 515K accounts, 812 circular flows, 3,351 communities</b><br/><img src="docs/screenshots/graph_network_analysis.png" alt="Graph network analysis"/></td>
</tr>
</table>

---

## 📈 Results

**Dataset:** IBM AML synthetic transactions (*HI-Small*). 5,078,336 transactions, 515,080 accounts and 5,177 laundering cases, a **979 : 1** class imbalance.

<table>
<tr><td valign="top" width="58%">

#### 7 classical models — same 1,015,668-row held-out test set
| Model | AUC-ROC | AUC-PR | Recall | Fraud caught |
|---|:---:|:---:|:---:|:---:|
| 🥇 **XGBoost** (300 trees) | **0.9709** | **0.2379** | 51.1 % | 529 |
| LightGBM (300 trees) | 0.9707 | 0.2362 | 50.8 % | 526 |
| Hist Gradient Boosting | 0.9707 | 0.2177 | 68.2 % | 706 |
| Random Forest (200 trees) | 0.9687 | 0.0878 | 85.1 % | 881 |
| AdaBoost | 0.9579 | 0.1523 | 84.9 % | 879 |
| Decision Tree (depth 5) | 0.9554 | 0.0255 | 85.7 % | 887 |
| Logistic Regression | 0.9505 | 0.0149 | 93.7 % | 970 |

<sub>The **production XGBoost** (30 features, used by SHAP, the portal and the risk engine) reaches **AUC-ROC 0.9732**.</sub>

</td><td valign="top">

#### What the graph adds
| Graph signal | Fraud rate |
|---|:---:|
| Dataset baseline | 0.102 % |
| Transactions touching a **cycle** (812 found) | **0.485 %** · 4.8× |
| Inside **suspicious communities** | **1.41 %** · 14× |
| **Mule score 4** accounts | **3.64 %** · 36× |

#### Honest notes
- The CNN-1D sequence model is close to random on this data (AUC-ROC 0.587). The dashboard reports that openly instead of hiding it.
- The Risk Engine has a live diagnostic: at the same 2.54 % alert budget, ranking by **XGBoost alone catches 4.35× more fraud** than the current ensemble. Re-weighting it is on the roadmap.

</td></tr>
</table>

---

## 🏗️ System architecture

<div align="center">
<img src="docs/assets/architecture.svg" alt="System architecture" width="100%"/>
</div>

<details>
<summary><b>How the serving layer is put together</b></summary>

- **`dashboard/app.py`** is the core backend. It holds a registry of every model and result file and serves the overview, the 11 notebook tabs, live prediction and the chart server.
- **`dashboard/new.py`** is the entry point. It *imports* `app.py` instead of copying it, adds the User Portal and Investigation Workbench APIs, and injects `new.html` + `new.js` into the page.
- A **transaction index** over all 5,078,336 rows (numpy arrays + byte offsets into the CSV) builds in the background on first start, is cached in `data/precomputed/`, and rebuilds itself if a source file changes.
- Analyst actions are appended to `results/analyst_audit_log.jsonl`, so every decision has a trail.

</details>

---

## 🔄 Project pipeline

<div align="center">
<img src="docs/assets/pipeline.svg" alt="Project pipeline" width="100%"/>
</div>

| # | Notebook | What it does | Main output |
|:-:|---|---|---|
| 01 | `01_data_understanding_and_cleaning` | profile & clean the raw IBM data | `data/cleaned_transactions.csv` |
| 02 | `02_exploratory_data_analysis` | time, payment-format, bank & currency patterns | `results/charts/eda_charts/` |
| 03 | `03_feature_engineering` | velocity, amount-vs-usual, cross-bank, outlier flags | `data/featured/` |
| 04 | `04_graph_network_analysis` | NetworkX graph, PageRank, cycles, communities, mules | `featured_with_graph.csv`, community CSVs |
| 05 | `05_preprocessing` | scaling, train/test split, SMOTE | `data/preprocessed/` |
| 06 | `06_ml_models_comparison` | 7 models benchmarked | `models/*.pkl`, `ml_comparison_results.csv` |
| 07 | `07_shap_explainability` | TreeExplainer, global + local importance | `shap_explainer.pkl`, SHAP charts |
| 08 | `08_lstm_deep_learning` | LSTM over account sequences | `lstm_model.pt`, `lstm_predictions.csv` |
| 09 | `09_cnn_deep_learning` | multi-scale CNN-1D (kernels 3·5·7) | `cnn_model.pt`, `cnn_scores.csv` |
| 10 | `10_risk_scoring_engine` | weighted ensemble → calibrated LOW / MEDIUM / HIGH / CRITICAL | `final_risk_scores.csv`, `alerts.csv` |

---

## 🧭 User flow

<div align="center">
<img src="docs/assets/user_flow.svg" alt="User flow" width="100%"/>
</div>

---

## 📁 Folder structure

```
FinShieldAI/
├── 📓 notebooks/                    # the full pipeline, run 01 → 10
│   ├── 01_data_understanding_and_cleaning.ipynb
│   ├── 02_exploratory_data_analysis.ipynb
│   ├── 03_feature_engineering.ipynb
│   ├── 04_graph_network_analysis.ipynb
│   ├── 05_preprocessing.ipynb
│   ├── 06_ml_models_comparison.ipynb
│   ├── 07_shap_explainability.ipynb
│   ├── 08_lstm_deep_learning.ipynb
│   ├── 09_cnn_deep_learning.ipynb
│   └── 10_risk_scoring_engine.ipynb
│
├── 🖥️ dashboard/                    # the web app
│   ├── new.py                       # ▶ entry point — python dashboard/new.py
│   ├── app.py                       # core backend (imported by new.py)
│   ├── new.html                     # User Portal + Investigation Workbench UI
│   ├── new.js                       # front-end logic for the new tabs
│   ├── templates/dashboard.html     # base dashboard page
│   └── static/                      # dashboard.js · chart.umd.min.js
│
├── 🧠 models/                       # 23 trained artifacts (.pkl / .pt)
├── 📊 results/                      # metrics, risk scores, alerts (.csv)
│   └── charts/                      # 37 charts produced by the notebooks
├── 🗄️ data/                         # cleaned, featured, preprocessed, precomputed
├── 🛠️ scripts/precompute_transactions.py
├── 📚 docs/                         # README assets, screenshots, presentation
│   ├── assets/                      # diagrams (SVG) + demo GIFs
│   └── screenshots/
├── requirements.txt
├── Dockerfile · Procfile · render.yaml
└── README.md
```

> **Large files aren't on GitHub.** Anything over GitHub's 100 MB limit (the cleaned dataset, feature tables, train/test splits, full risk-score tables, `random_forest.pkl`) is in `.gitignore`. Run the notebooks in order to regenerate them. The dashboard still starts without them, and each affected panel says what's missing.

---

## 🚀 Getting started

```bash
git clone https://github.com/tjain2004/FINSHEILD-AI.git
cd FINSHEILD-AI
pip install -r requirements.txt
python dashboard/new.py
```

Open **http://localhost:5000**. The first start takes 20–40 seconds. The transaction index for the Workbench builds in the background and is cached after that.

<details>
<summary><b>Deploy (Docker / Render / Heroku-style)</b></summary>

All three configs start the same app:

```bash
gunicorn --chdir dashboard new:app --workers 1 --threads 4 --timeout 180
```

```bash
docker build -t finshield-ai .
docker run -p 10000:10000 finshield-ai
```
</details>

<details>
<summary><b>API reference</b></summary>

| Endpoint | Returns |
|---|---|
| `GET /api/overview` | headline dataset + pipeline stats |
| `GET /api/account/<id>/network` | linked accounts, mule & community flags (Overview network) |
| `GET /api/transaction/<id>` | Overview transaction search |
| `GET /api/ml_comparison` | all 7 models with every metric |
| `GET /api/shap_importance?n=20` | global SHAP importance |
| `GET /api/risk_overview` · `/api/risk_diagnostics` | ensemble weights, tiers, capture diagnostics |
| `GET /api/alerts?page=1&level=CRITICAL` | paginated alert queue |
| `POST /api/predict` | live scoring: percentile tier + SHAP + SAR narrative |
| `GET /api/portal/meta` · `POST /api/portal/score` | User Portal screening |
| `POST /api/check-url` | phishing-link check |
| `GET /api/wb/txn/<id>` · `/api/wb/alert/<id>` · `/api/wb/account/<id>` | Workbench lookups |
| `GET /api/wb/network/<acc>?depth=2&limit=20` | linked-account graph (1–2 hops) |
| `GET /api/wb/explain/<row>` | per-transaction SHAP |
| `POST /api/wb/action` · `GET /api/wb/audit` | analyst decisions + audit trail |
| `GET /api/wb/sar/<alert>` | auto-drafted SAR |

</details>

---

## 🤖 Future scope — FinShield Agents

Today an analyst clicks through the Workbench. Next, **a team of AI agents does the legwork** using the same
APIs FinShield already exposes, and **a human signs off** on every decision.

<div align="center">
<img src="docs/assets/agentic_future.svg" alt="Agentic AI future scope" width="100%"/>
</div>

| Agent | Job | Calls (already built) |
|---|---|---|
| 🚦 **Triage** | ranks the queue and groups alerts that belong to the same ring | `/api/alerts`, `/api/wb/network` |
| 🕸️ **Investigator** | walks the money graph autonomously and stops at mules, hubs and cycles | `/api/wb/network`, `/api/wb/account` |
| 🔍 **Explainer** | turns SHAP values and account history into a readable case narrative | `/api/wb/explain` |
| 📝 **SAR Drafter** | writes the Suspicious Activity Report for the analyst to approve | `/api/wb/sar` |
| 🌐 **Watchlist** | sanctions / PEP / adverse-media screening | *new connector* |
| 🔁 **Learning** | turns analyst verdicts from the audit log into retraining data | `results/analyst_audit_log.jsonl` |

**Roadmap**
- [x] ML + graph + SHAP pipeline over 5.08M transactions
- [x] User Portal, Investigation Workbench, linked-account network, SAR drafts, audit trail
- [ ] Re-weight the Risk Engine toward XGBoost (+4.35× fraud capture at the same alert budget)
- [ ] Agent orchestrator with tool-calling over the `/api/wb/*` endpoints
- [ ] Ring-level alerts (score a whole community, not just one transaction)
- [ ] Graph neural network (GNN) on the transaction graph
- [ ] Streaming ingestion for real-time scoring

> **Guardrails by design:** agents only suggest. An analyst approves every SAR, nothing is blocked automatically, and every step goes to the audit log.

---

## 🧰 Tech stack

<div align="center">

<img src="https://skillicons.dev/icons?i=python,pytorch,sklearn,flask,js,html,css,docker,git,github&theme=dark" alt="tech stack"/>

<br/><br/>

<img src="https://img.shields.io/badge/pandas-150458?style=flat-square&logo=pandas&logoColor=white"/>
<img src="https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white"/>
<img src="https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white"/>
<img src="https://img.shields.io/badge/XGBoost-1A73E8?style=flat-square"/>
<img src="https://img.shields.io/badge/LightGBM-02569B?style=flat-square"/>
<img src="https://img.shields.io/badge/SHAP-8A2BE2?style=flat-square"/>
<img src="https://img.shields.io/badge/imbalanced--learn_(SMOTE)-555?style=flat-square"/>
<img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white"/>
<img src="https://img.shields.io/badge/NetworkX-2C5BB4?style=flat-square"/>
<img src="https://img.shields.io/badge/Jupyter-F37626?style=flat-square&logo=jupyter&logoColor=white"/>
<img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/Gunicorn-499848?style=flat-square&logo=gunicorn&logoColor=white"/>
<img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Cytoscape.js-F7DF1E?style=flat-square&logoColor=black"/>
<img src="https://img.shields.io/badge/Apache_Parquet-50ABF1?style=flat-square&logo=apacheparquet&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black"/>

</div>

---

## 🙏 Dataset & acknowledgements

- **IBM Transactions for Anti Money Laundering (AML)**, *HI-Small* variant (synthetic data). No real customer data is used anywhere in this project.
- FinShield AI is a research and education project. It is not a production compliance system, and its outputs are not legal determinations.

<div align="center">

<br/>

Made with ☕ and a lot of graph traversals by **[@tjain2004](https://github.com/tjain2004)**

<sub>If this project helped you, consider leaving a ⭐</sub>

</div>

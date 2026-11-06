# QueueSense AI – Intelligent Predictive Queue Management System

> **A production-ready, full-stack, AI-powered predictive queue and counter management platform.** Built for hospitals, banks, colleges, and service centers to eliminate wait-time uncertainty, balance counter workloads dynamically, and prevent overcrowding through machine learning and real-time WebSockets.

---

## 1. Project Overview & Problem Statement

Traditional queue ticketing systems are passive: they assign numbers, display counter calls, and leave visitors waiting blindly without knowing when they will be served. Administrators lack foresight into impending bottlenecks, often realizing a desk is overloaded only after waiting rooms are overflowing.

### The Solution: QueueSense AI
**QueueSense AI** transforms queue operations from reactive counting to proactive orchestration:
1. **Predictive Waiting Time Engine**: Real-time waiting time estimation powered by trained ensemble machine learning models with empirical confidence intervals.
2. **Intelligent Counter Allocation**: Score-based counter matching considering service compatibility, current backlog, staff processing speed, and priority tier.
3. **Early Congestion Alerting**: Multi-tier alert monitor (\`Low\`, \`Medium\`, \`High\`, \`Critical\`) forecasting bottlenecks before lines back up.
4. **Live QR Mobile Passes**: Scannable QR passes for every token, enabling patients and customers to roam freely and receive WebSocket updates.
5. **Interactive Hackathon Simulators**: Built-in Crowd Stress Simulator and What-If Capacity Modeler for live demonstration of crowd surges, delays, and counter shutdowns.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS (Sophisticated Navy & Cyan theme)
- **Data Visualization**: Recharts (dynamic area, line, pie, and bar charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT Bearer interceptors
- **Routing**: React Router v6
- **QR Engine**: \`qrcode.react\` SVG passes

### Backend
- **Language**: Python 3.12+ (tested on Python 3.14)
- **Framework**: FastAPI (high-concurrency async ASGI)
- **ASGI Server**: Uvicorn
- **ORM / Database**: SQLAlchemy 2.0 with SQLite (structured for straightforward PostgreSQL migration)
- **Validation**: Pydantic v2
- **Authentication**: JWT (\`python-jose\`) + salted \`bcrypt\` password hashing
- **Real-Time Protocol**: WebSockets (\`/ws/queue\`) with automatic reconnection and fallback polling

### Machine Learning
- **Libraries**: Scikit-Learn, Pandas, NumPy, Joblib
- **Models**:
  - Baseline: **Linear Regression**
  - Primary Production Model: **Random Forest Regressor** (100 estimators, max depth 16)
- **Metrics**: MAE, MSE, RMSE, R² Score with tree-variance uncertainty estimation

### Testing & Quality Control
- **Backend**: Pytest with FastAPI TestClient (16 passing unit and integration tests)
- **Frontend**: Vite production build verification (\`npm run build\`)

---

## 3. System Architecture

```text
QueueSense-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & lifespan seeding
│   │   ├── database.py              # SQLAlchemy engine & session factory
│   │   ├── models.py                # ORM models (User, Counter, Token, Alert)
│   │   ├── schemas.py               # Pydantic v2 schemas
│   │   ├── crud.py                  # Database operations & bcrypt auth
│   │   ├── routers/
│   │   │   ├── auth.py              # Register, login, profile (/api/auth)
│   │   │   ├── tokens.py            # Token generation, status, cancel (/api/tokens)
│   │   │   ├── counters.py          # Counter fleet & recommendations (/api/counters)
│   │   │   ├── predictions.py       # ML wait inference & metrics (/api/predictions)
│   │   │   ├── analytics.py         # KPIs, hourly throughput, impact (/api/analytics)
│   │   │   ├── alerts.py            # Bottleneck alerts (/api/alerts)
│   │   │   └── simulation.py        # Crowd injector & What-If (/api/simulation)
│   │   ├── services/
│   │   │   ├── queue_engine.py       # Queue state transitions & priority sorting
│   │   │   ├── allocation_engine.py  # Score-based counter matching
│   │   │   ├── prediction_service.py # Live DB-to-ML feature bridge
│   │   │   └── websocket_manager.py  # Real-time WebSocket broadcaster
│   │   └── ml/
│   │       ├── generate_dataset.py   # Stochastic queue data generator (12,000 records)
│   │       ├── train_model.py        # Model training pipeline & cross-validation
│   │       ├── predict.py            # Tree-variance inference engine
│   │       └── model_metrics.py      # Metric evaluation utilities
│   ├── data/
│   │   └── queue_training_data.csv  # 12,000 realistic synthetic records
│   ├── saved_models/
│   │   ├── queue_wait_model.joblib  # Serialized pipeline (preprocessor + RF)
│   │   └── metrics.json             # Serialized evaluation metrics
│   ├── tests/
│   │   ├── conftest.py              # Test database and client fixtures
│   │   ├── test_auth.py             # Auth & RBAC tests
│   │   ├── test_tokens.py           # Token generation & lifecycle tests
│   │   ├── test_counters.py         # Counter management & dispatch tests
│   │   ├── test_predictions.py      # ML prediction inference tests
│   │   └── test_simulation.py       # Live crowd simulator tests
│   └── requirements.txt             # Python dependency manifest
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Sidebar, StatCard, QRModal, SimulatorBar
│   │   ├── context/                 # AuthContext, QueueContext (WebSockets)
│   │   ├── pages/                   # All 12 application dashboards and portals
│   │   ├── services/api.js          # Axios client with interceptors
│   │   ├── App.jsx                  # Main routing
│   │   └── main.jsx                 # React root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── setup_windows.bat                # Automated Windows environment installer
├── start_project.bat                # One-click dual server launcher
└── README.md
```

---

## 4. Machine Learning Methodology

### Synthetic Dataset Generation
A stochastic simulator (\`generate_dataset.py\`) creates 12,000 records modeling an $M/M/c$ multi-server queue with non-homogeneous Poisson arrivals:
- **Features Used**:
  - \`arrival_hour\` (8 to 19, with morning 10–12 and afternoon 14–16 rush peaks)
  - \`day_of_week\` (0=Monday to 6=Sunday, weekdays carrying 85% volume)
  - \`people_waiting\` (queue length at customer arrival)
  - \`active_counters\` (operational counters open)
  - \`average_service_time\` (department duration distribution)
  - \`service_category\` (General Consultation, Emergency, Billing, Registration, Laboratory, Other)
  - \`priority_level\` (Regular, Senior/Disabled, VIP, Emergency)
  - \`counter_workload\` (backlog per active counter)
  - \`arrival_rate\` (dynamic Poisson parameter $\lambda$)
  - \`historical_average_wait\` (contextual rolling expectation)
- **Ground Truth Target**:
  - \`actual_waiting_time\`: Computed via queue physics with priority fast-tracking and stochastic individual variance.
  - **No Target Leakage**: Features strictly reflect information visible at the instant of token generation.

### Model Evaluation Results

| Metric | Linear Regression Baseline | Random Forest Regressor (Selected) | Improvement |
| :--- | :---: | :---: | :---: |
| **Mean Absolute Error (MAE)** | 5.630 min | **1.654 min** | **70.6% error reduction** |
| **Root Mean Squared Error (RMSE)** | 10.097 min | **2.226 min** | **78.0% error reduction** |
| **Mean Squared Error (MSE)** | 101.953 | **4.955** | **95.1% variance reduction** |
| **$R^2$ Score** | 0.8037 | **0.9905** | **Near-perfect fit** |

### Uncertainty Estimation
Inference queries (\`POST /api/predictions/waiting-time\`) compute individual tree predictions across all 100 decision trees in the ensemble. The empirical standard deviation across trees yields a mathematically rigorous 95% confidence interval ($\text{Prediction} \pm 1.96 \cdot \sigma_{\text{trees}}$), clearly documented as an empirical statistical estimate without hardcoded percentages.

---

## 5. Intelligent Counter Allocation

Incoming tokens are evaluated through a multi-factor ranking algorithm:
$$\text{Score}(c) = (\text{Backlog}_c + \text{BusyPenalty}_c) \times \mu_c - \text{CategoryAffinity}_c$$
Where:
- Counters with active matching specializations receive priority affinity.
- Desks currently idle receive zero busy penalty.
- Emergency tokens prioritize counters with the lowest immediate backlog and shortest service cycle.
- **Explainability**: Every recommendation returns a human-readable justification (e.g. *"Counter 1 (Consultation Room A) recommended: Dedicated specialist for General Consultation, currently idle and ready to serve immediately."*).

---

## 6. Frontend Pages & User Journeys

The interface features 12 responsive views:

1. **Landing Page (\`/\`)**: Interactive hero, live system metric ribbon, feature breakdown, and demo links.
2. **Login Page (\`/login\`)**: Credential authentication with **one-click demo login buttons** for judges.
3. **Registration Page (\`/register\`)**: User onboarding with instant token generation access.
4. **User Dashboard (\`/user/dashboard\`)**: Active token tracker, position in line, estimated wait countdown, past visit history, and QR pass button.
5. **Generate Token Page (\`/user/generate-token\`)**: Interactive category and priority selector featuring a **live AI forecast preview** that updates dynamically before submitting.
6. **Live Queue Tracking Page (\`/track/:tokenId\`)**: Real-time progress bar (Waiting $\rightarrow$ Called $\rightarrow$ In Service $\rightarrow$ Completed), countdown, and cancel options.
7. **Admin Dashboard (\`/admin/dashboard\`)**: Operational command center with 6 KPI cards, hourly throughput area charts, department pie charts, and active desk grid with "Call Next" triggers.
8. **Counter Management (\`/admin/counters\`)**: Toggle desk active/closed status, deploy new counters, and call waiting patients.
9. **AI Prediction Dashboard (\`/admin/ai-predictions\`)**: Model comparison benchmarks, MAE/RMSE tables, and an **interactive prediction sandbox** with sliders.
10. **Analytics and Reports (\`/admin/analytics\`)**: Wait time distribution histogram, hourly volume correlation, and **Impact Analytics** calculating minutes saved against static baselines.
11. **Alerts and Notifications (\`/admin/alerts\`)**: Overcrowding warning monitors with severity tags and resolution actions.
12. **Settings Page (\`/admin/settings\`)**: Alert threshold boundaries, anti-starvation policy controls, and factory demo reset.

---

## 7. Hackathon Special Features

- **Live Crowd Simulator**: Top/bottom drawer allowing judges to inject **+10, +25, or +50 simulated arrivals**, trigger operational delays, simulate unexpected counter closures, or reset back to baseline. Charts and tables update instantly via WebSockets.
- **What-If Capacity Modeler**: Compares Scenario 1 (Baseline), Scenario 2 (+1 Counter), and Scenario 3 (AI Dynamic Allocation) displaying wait time reductions and throughput gains.
- **QR Code Token Passes**: Renders scannable SVG QR codes for any token, enabling mobile device handoff.
- **Priority-Aware Fair Queueing**: Elevates critical emergency tokens without starving standard visitors through transparent anti-starvation aging rules.
- **Impact Analytics**: Transparently calculates minutes saved per patient against a defined static FIFO queue baseline (24.5 min benchmark).

---

## 8. Demo Credentials

For live judge demonstrations:

| Role | Email | Password | Pre-Configured Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | \`admin@queuesense.ai\` | \`Admin@123\` | Full access to all dashboards, simulator, counters, and settings |
| **Standard Visitor** | \`user@queuesense.ai\` | \`User@123\` | User dashboard, token generation, and live QR pass tracking |

*(You can also click the quick demo buttons on the Login page to sign in with one click).*

---

## 9. Quick Start Guide (Windows)

### Automated Setup
1. Double-click or run:
   \`\`\`cmd
   setup_windows.bat
   \`\`\`
   This will verify Python and Node.js, create the virtual environment, install all dependencies, generate the 12,000-record dataset, train the Random Forest model, and prepare the database.

2. Launch the application:
   \`\`\`cmd
   start_project.bat
   \`\`\`
   This will start both the FastAPI backend and Vite frontend, then open \`http://localhost:5173\` in your default browser.

### Manual Setup Procedure

#### 1. Backend Setup
\`\`\`bash
# Create and activate virtual environment
python -m venv backend/venv
backend\venv\Scripts\activate

# Install requirements
pip install -r backend/requirements.txt

# Generate dataset and train models
python -m backend.app.ml.generate_dataset
python -m backend.app.ml.train_model

# Run tests
set PYTHONPATH=.
pytest -v backend/tests

# Start backend server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
\`\`\`

#### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install --legacy-peer-deps
npm run build    # Verify build integrity
npm run dev      # Start dev server on http://localhost:5173
\`\`\`

---

## 10. API Documentation Summary

Interactive OpenAPI Swagger documentation is available at \`http://localhost:8000/docs\`.

### Key Endpoints:
- **Authentication**:
  - \`POST /api/auth/register\` – Register new user
  - \`POST /api/auth/login\` – Authenticate and receive JWT token
  - \`GET /api/auth/me\` – Retrieve current user profile
- **Tokens**:
  - \`POST /api/tokens\` – Generate digital token with ML wait prediction & auto-allocation
  - \`GET /api/tokens\` – List tokens (supports status and category filters)
  - \`GET /api/tokens/{token_id}\` – Get token details by ID or token number (e.g. \`GEN-101\`)
  - \`PATCH /api/tokens/{token_id}/status\` – Transition status (\`Waiting\` $\rightarrow$ \`Called\` $\rightarrow$ \`In Service\` $\rightarrow$ \`Completed\`)
  - \`DELETE /api/tokens/{token_id}\` – Cancel token
- **Counters**:
  - \`GET /api/counters\` – List all counters and workloads
  - \`POST /api/counters\` – Deploy new counter desk
  - \`PATCH /api/counters/{counter_id}\` – Update desk status or active state
  - \`POST /api/counters/{counter_id}/call-next\` – Call highest-priority waiting patient
  - \`POST /api/counters/recommend\` – Get intelligent counter recommendation with rationale
- **Predictions & ML**:
  - \`POST /api/predictions/waiting-time\` – ML waiting time prediction with 95% confidence intervals
  - \`GET /api/predictions/model-performance\` – Return MAE, MSE, RMSE, R² metrics
- **Analytics & Simulation**:
  - \`GET /api/analytics/overview\` – Real-time operational KPIs and time saved
  - \`GET /api/analytics/hourly\` – Hourly arrival and completion trendline
  - \`GET /api/analytics/waiting-times\` – Wait duration distribution histogram
  - \`POST /api/simulation/arrivals\` – Inject batch arrivals (+10, +25, +50)
  - \`POST /api/simulation/delay\` – Simulate service delays
  - \`POST /api/simulation/counter-closure\` – Simulate desk failure and token rerouting
  - \`POST /api/simulation/reset\` – Reset queue state to factory demo baseline
  - \`GET /api/simulation/what-if\` – Run What-If capacity comparisons
- **WebSockets**:
  - \`WS /ws/queue\` – Full duplex live event channel

---

## 11. Assumptions & Limitations

- **Dataset**: Training data is high-fidelity synthetic data modeled on stochastic queueing theory. It is not confidential real patient data.
- **Single Facility Scope**: Designed for single-location multi-counter facilities (hospitals, bank branches, DMV centers). Multi-facility enterprise replication requires database sharding or PostgreSQL read replicas.
- **Physical Hardware**: Designed to integrate with external digital signage displays and thermal token printers via REST/WebSocket triggers; physical hardware integration is simulated via web views and QR passes.

---

## 12. Future Enhancements

- Multi-branch cross-facility appointment scheduling and routing.
- Native SMS & WhatsApp notifications via Twilio / Gupshup integration.
- Facial recognition walk-in check-in kiosk integration.
- Reinforcement learning (PPO) for continuous dynamic counter reassignment.

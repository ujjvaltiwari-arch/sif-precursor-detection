# SIF Precursor Detection System

**Smart India Hackathon 2026 — Problem Statement 26165**

An AI/NLP-powered system for detecting Serious Injury & Fatality (SIF) precursors in Oil India Limited safety reports.

---

## Architecture

```
├── backend/                  FastAPI REST API + ML Engine
│   ├── app/
│   │   ├── api/v1/           6 routers: health, analyze, reports, analytics, alerts, model
│   │   ├── core/             Config, logging, database session
│   │   ├── ml/               Pipeline, trainers, explainers (SHAP, LIME, Keywords)
│   │   ├── models/           8 SQLAlchemy ORM models
│   │   ├── schemas/          Pydantic request/response schemas
│   │   └── services/         Report, Alert, Analytics, Prediction services
│   ├── tests/                130 pytest tests across 10 test files
│   └── models/baseline/      Trained TF-IDF + LogisticRegression artifacts
├── frontend/                 React 19 + Vite 8 + Tailwind CSS v4
│   └── src/
│       ├── pages/            Overview, Analytics, Heatmap, Watchlist, AnalyzeReport
│       ├── components/       Layout (Sidebar), common (RiskBadge)
│       ├── services/         Axios API client
│       └── types/            TypeScript interfaces
├── data/synthetic/           250 synthetic safety reports
├── docker/                   Dockerfile.backend, Dockerfile.frontend, docker-compose.yml, nginx.conf
├── docs/                     Architecture document
├── start.bat                 Windows launcher
├── start.sh                  Linux/macOS launcher
└── .env.example              Environment configuration template
```

## Quick Start

### Windows
```cmd
start.bat
```

### Linux/macOS
```bash
chmod +x start.sh
./start.sh
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
cd docker
docker-compose up --build
```

## Access

| Service    | URL                                |
|------------|------------------------------------|
| Frontend   | http://localhost:5173              |
| Backend    | http://localhost:8000              |
| API Docs   | http://localhost:8000/docs         |
| Network    | http://10.30.252.39:5173           |

## API Endpoints

| Method | Endpoint                    | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | `/health`                   | Health check                    |
| POST   | `/api/v1/analyze`           | Analyze a safety report         |
| GET    | `/api/v1/reports`           | List reports (paginated)        |
| GET    | `/api/v1/reports/{id}`      | Get report by ID                |
| DELETE | `/api/v1/reports/{id}`      | Delete report                   |
| GET    | `/api/v1/analytics/overview`| Dashboard overview stats        |
| GET    | `/api/v1/analytics/trends`  | Precursor trend data            |
| GET    | `/api/v1/analytics/heatmap` | Site/department risk heatmap    |
| GET    | `/api/v1/alerts`            | List alerts                     |
| POST   | `/api/v1/alerts/{id}/acknowledge` | Acknowledge alert          |
| POST   | `/api/v1/alerts/{id}/resolve`     | Resolve alert               |
| DELETE | `/api/v1/alerts/{id}`       | Dismiss alert                   |
| GET    | `/api/v1/model/info`        | Model metadata                  |

## Tech Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, SQLite
- **ML:** scikit-learn, PyTorch, Transformers, SHAP, LIME
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Recharts
- **Testing:** 130 pytest tests (unit + integration)

## Testing

```bash
cd backend
python -m pytest tests/ -v
```

## License

Internal project — Smart India Hackathon 2026.

# CRM Retail Intelligence

Customer relationship management starter project built around the provided online retail dataset.

## What it includes

- FastAPI backend for customer analytics and segment summaries
- React + Vite frontend dashboard
- MLflow-backed training script for RFM-based customer segmentation
- GitHub Actions, Bitbucket Pipelines, and Jenkins pipeline definitions
- Docker Compose for local development

## Dataset

Place the dataset at the repository root as `online_retail_listing.csv`. The backend and ML pipeline read it directly.

## Features

- Customer-level RFM metrics
- Segment labels derived from KMeans clustering
- KPI cards, customer table, and segment distribution chart in the frontend
- MLflow experiment tracking for model training runs

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Training

```bash
cd backend
python ml/train.py
```

### Docker Compose

```bash
docker compose up --build
```

## CI/CD files

- `.github/workflows/ci.yml`
- `bitbucket-pipelines.yml`
- `Jenkinsfile`

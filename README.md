# Flat-AI

A MERN-based platform for property listings with ML-powered price prediction and recommendations.

## Project Structure

```
Website/
├── Backend/    # Node.js/Express API (auth, listings, admin)
├── frontend/   # React frontend
└── ml/         # Python ML services (price prediction & recommendations)
```

## Getting Started

### Prerequisites

- Node.js
- Python 3 (for the ML service)

### Install dependencies

```bash
cd Website/Backend && npm install
cd ../frontend && npm install
```

### Run

From `Website/`:

```bash
npm run start:backend   # starts the Express API
npm run start:frontend  # starts the React app
npm run start:ml        # starts the Django ML service
npm run dev              # runs backend + frontend together (Windows/PowerShell)
```

### Tests

Backend tests live in `Website/Backend/tests` and use Node's built-in test runner:

```bash
cd Website/Backend
node --test tests/
```

## Deployment

Deployment configuration for Vercel is in [`vercel.json`](./vercel.json).

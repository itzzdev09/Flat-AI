# Flat-AI

A MERN-based platform for property listings with ML-powered price prediction and recommendations.

**Live demo:** [flat-ai.vercel.app](https://flat-ai.vercel.app)

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
cd ../ml && pip install -r requirements.txt
```

### Configure environment

Each service reads its own `.env`, and none of them are committed. Copy the
templates before the first run:

```bash
cp Website/Backend/.env.example  Website/Backend/.env
cp Website/frontend/.env.example Website/frontend/.env
cp Website/ml/.env.example       Website/ml/.env
```

Then edit the values that have no safe default:

| File | Key | Notes |
| --- | --- | --- |
| `Backend/.env` | `JWT_SECRET` | Required. Signup, login and every protected route fail without it. |
| `Backend/.env` | `MONGODB_URI` | Defaults to a local mongod. Set `MONGODB_URI_ATLAS` to use Atlas instead. |
| `Backend/.env` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstraps the first admin account on startup. Skipped if the password is unset, and skipped if that account already exists. |
| `frontend/.env` | `REACT_APP_NODE_API_URL` | Must end with a trailing slash, and the port must match `Backend/.env` `PORT`. |
| `frontend/.env` | `REACT_APP_DJANGO_API_URL` | Must end with a trailing slash. Only needed for the Django-backed recommendations. |
| `ml/.env` | `DJANGO_SECRET_KEY` | Required by Django. |

The React values are inlined at build time, so restart `npm start` (or rebuild)
after changing them.

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
npm test
```

Frontend tests use the Create React App runner:

```bash
cd Website/frontend
npm test -- --watchAll=false
```

ML service tests use the Django runner:

```bash
cd Website/ml
python manage.py test
```

## Deployment

Deployment configuration for Vercel is in [`vercel.json`](./vercel.json).

## License

MIT — see [LICENSE](./LICENSE).

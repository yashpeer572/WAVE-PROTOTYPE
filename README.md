# WAVE

Program management application with a Laravel API backend and a React SPA frontend.

## Project Structure

```
WAVE/
├── backend/    Laravel PHP API (Sanctum auth, SQLite)
├── frontend/   React + Vite SPA
└── docs/       Requirements & design documents
```

## Getting Started

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

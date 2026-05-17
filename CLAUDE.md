Do not add Co-Authored-By lines to commit messages.

## Project: Seguidor

Multi-tenant CRM SaaS for small businesses.

### Structure
- `api/` — Laravel 12 API
- `web/` — React SPA (Vite + TypeScript + Tailwind)

### Development
```
docker compose up -d
```

API: http://localhost:8000
Frontend: http://localhost:5173

### Testing
```
cd api && php artisan test
```

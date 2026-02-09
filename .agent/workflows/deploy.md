---
description: how to deploy frontend changes to production
---
// turbo-all

## Deploy Frontend

1. Build the frontend:
```bash
cd /opt/whaticket/frontend && npm run build
```

2. Verify the build output exists:
```bash
ls -la /opt/whaticket/frontend/build/index.html
```

That's it. Caddy serves from `/opt/whaticket/frontend/build/` via bind mount — no container restart needed.

> **Note:** Users may need to hard-refresh (Ctrl+Shift+R) to see JS/CSS changes due to browser caching.

## Deploy Backend

1. Rebuild and restart the backend container:
```bash
cd /opt/whaticket && docker compose up -d --build backend
```

## Deploy Both

1. Build frontend:
```bash
cd /opt/whaticket/frontend && npm run build
```

2. Rebuild backend:
```bash
cd /opt/whaticket && docker compose up -d --build backend
```

## Architecture Reference

```
Source:     /opt/whaticket/frontend/src/
Build:     /opt/whaticket/frontend/build/  ← Caddy bind mount (read-only)
Caddy:     app.komu.us:443 → static files from build/
Backend:   api.komu.us:443 → Docker whaticket-backend-1:8080
```

# Proplr Portfolio API

This project serves the portfolio page and adds a small API for the research request intake tracker.

## Run

```bash
node server.js
```

Open `http://localhost:3000`.

If you have `npm` installed, `npm start` works too.

## Endpoints

- `GET /api/health`
- `GET /api/research-requests`
- `GET /api/research-requests?status=new`
- `POST /api/research-requests`
- `PATCH /api/research-requests/:id/status`

Submitted requests are saved in `data/research-requests.json`.

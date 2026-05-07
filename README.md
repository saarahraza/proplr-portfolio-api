# Proplr Portfolio API

This project serves the portfolio page and adds a small API for the research request intake tracker.

## Run

```bash
node server.js
```

Open `http://localhost:3000`.

The standalone Content Strategy Agent page is available at `http://localhost:3000/content-agent`.

If you have `npm` installed, `npm start` works too.

## Endpoints

- `GET /api/health`
- `GET /api/research-requests`
- `GET /api/research-requests?status=new`
- `POST /api/research-requests`
- `PATCH /api/research-requests/:id/status`
- `POST /api/content-strategy`

Submitted requests are saved in `data/research-requests.json`.

The content strategy endpoint powers the AI Content Strategy Agent demo. It generates a Proplr-style LinkedIn content calendar from audience, topic, goal, tone, and post count inputs.

# Proplr Portfolio API

This project serves the portfolio page and adds a small API for the research request intake tracker.

## Run

```bash
node server.js
```

Open `http://localhost:3000`.

The combined AI Agency Toolkit page is available at `http://localhost:3000/agency-agents`.

If you have `npm` installed, `npm start` works too.

## Endpoints

- `GET /api/health`
- `GET /api/research-requests`
- `GET /api/research-requests?status=new`
- `POST /api/research-requests`
- `PATCH /api/research-requests/:id/status`
- `POST /api/content-strategy`
- `POST /api/performance-brief`
- `POST /api/seo-opportunity`
- `POST /api/campaign-qa`
- `POST /api/reporting-insight`

Submitted requests are saved in `data/research-requests.json`.

The content strategy endpoint powers the Content Strategy Agent inside the AI Agency Toolkit. It generates a Proplr-style LinkedIn content calendar from audience, topic, goal, tone, and post count inputs.

The agent is tuned around Proplr's public positioning: Google Cloud consulting, managed cloud services, fractional cloud expertise, secure cloud architecture, security and compliance, AI-powered FinOps, and generative AI on Google Cloud.

The AI Agency Toolkit adds practical internship-aligned agents for content strategy, performance briefs, SEO recommendations, campaign QA, and reporting insights.

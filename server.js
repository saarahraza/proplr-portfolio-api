const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'research-requests.json');

const seedRequests = [
  { title: 'AI Engineer sourcing landscape - APAC Q2', team: 'Workforce Planning', priority: 'hi', status: 'progress', date: '2026-05-01' },
  { title: 'Competitor talent mapping - AWS & Azure', team: 'HR Business Partners', priority: 'hi', status: 'progress', date: '2026-04-28' },
  { title: 'Emerging skills in data center automation', team: 'Talent Acquisition', priority: 'med', status: 'new', date: '2026-05-03' },
  { title: 'Toronto cloud engineer talent pool analysis', team: 'Workforce Planning', priority: 'med', status: 'done', date: '2026-04-20' },
  { title: 'Glassdoor sentiment - APAC retention risk', team: 'HR Business Partners', priority: 'hi', status: 'blocked', date: '2026-04-15' },
  { title: 'Q3 compensation benchmarking - SRE roles', team: 'Total Rewards', priority: 'lo', status: 'done', date: '2026-04-10' }
].map((request, index) => ({
  id: `seed-${index + 1}`,
  name: 'Portfolio demo',
  type: '',
  context: 'Seeded example request for the portfolio tracker.',
  deadline: '',
  audience: '',
  createdAt: `${request.date}T12:00:00.000Z`,
  ...request
}));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(REQUESTS_FILE);
  } catch {
    await fs.writeFile(REQUESTS_FILE, JSON.stringify(seedRequests, null, 2));
  }
}

async function readRequests() {
  await ensureStore();
  const raw = await fs.readFile(REQUESTS_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeRequests(requests) {
  await ensureStore();
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message, details = undefined) {
  sendJson(res, status, { error: message, details });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Body must be valid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateRequest(input) {
  const request = {
    name: cleanString(input.name),
    team: cleanString(input.team),
    title: cleanString(input.title),
    type: cleanString(input.type),
    context: cleanString(input.context),
    deadline: cleanString(input.deadline),
    audience: cleanString(input.audience),
    priority: cleanString(input.priority)
  };

  const missing = ['name', 'team', 'title', 'context', 'priority'].filter(field => !request[field]);
  if (missing.length) {
    return { error: `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}` };
  }

  if (!['lo', 'med', 'hi'].includes(request.priority)) {
    return { error: 'Priority must be one of: lo, med, hi.' };
  }

  if (request.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(request.deadline)) {
    return { error: 'Deadline must use YYYY-MM-DD format.' };
  }

  return { request };
}

function buildContentStrategy(input) {
  const audience = cleanString(input.audience) || 'Startup founders';
  const topic = cleanString(input.topic) || 'AI transformation';
  const goal = cleanString(input.goal) || 'Education';
  const tone = cleanString(input.tone) || 'Direct and practical';
  const postCount = Math.min(Math.max(Number(input.postCount) || 3, 3), 7);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const postTypes = ['Pain point', 'Framework', 'Proof point', 'Contrarian take', 'Conversion'];
  const goalCtas = {
    Awareness: 'Save this before your next AI planning meeting.',
    Education: 'Audit one workflow before choosing another AI tool.',
    'Lead generation': 'Book a workflow audit before the next cloud sprint.',
    Trust: 'Use this as a checklist for your next implementation review.'
  };
  const audiencePain = {
    Founders: 'lost execution time',
    CTOs: 'tool sprawl and fragile integrations',
    'VP Engineering': 'slow delivery across platform and product teams',
    'Startup Teams': 'manual work hiding inside daily operations'
  };

  const pain = audiencePain[audience] || 'manual work hiding inside daily operations';
  const theme = `${topic} content sprint for ${audience}`;
  const posts = Array.from({ length: postCount }, (_, index) => {
    const type = postTypes[index % postTypes.length];
    const day = dayNames[index];
    const hookTemplates = [
      `${audience} do not need more AI tools. They need a cleaner workflow around ${topic}.`,
      `Most ${topic} projects stall because teams automate the wrong step first.`,
      `The fastest AI win is not a new platform. It is removing ${pain}.`,
      `If ${topic} takes six months to explain, the workflow is probably too vague.`,
      `Before buying another AI product, map the handoff that slows the team down.`
    ];

    return {
      day,
      type,
      hook: hookTemplates[index % hookTemplates.length],
      summary: `Write a ${tone.toLowerCase()} LinkedIn post for ${audience} that connects ${topic} to a practical business outcome. Focus on one clear workflow problem, one insight, and one next step.`,
      cta: goalCtas[goal] || goalCtas.Education
    };
  });

  return {
    agent: 'AI Content Strategy Agent',
    theme,
    audience,
    topic,
    goal,
    tone,
    posts
  };
}

async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, service: 'proplr-portfolio-api' });
  }

  if (req.method === 'GET' && url.pathname === '/api/research-requests') {
    const status = url.searchParams.get('status');
    const requests = await readRequests();
    const filtered = status && status !== 'all' ? requests.filter(request => request.status === status) : requests;
    return sendJson(res, 200, { requests: filtered });
  }

  if (req.method === 'POST' && url.pathname === '/api/research-requests') {
    const body = await readBody(req);
    const result = validateRequest(body);
    if (result.error) {
      return sendError(res, 400, result.error);
    }

    const createdAt = new Date().toISOString();
    const request = {
      id: crypto.randomUUID(),
      ...result.request,
      status: 'new',
      date: createdAt.slice(0, 10),
      createdAt
    };
    const requests = await readRequests();
    requests.unshift(request);
    await writeRequests(requests);
    return sendJson(res, 201, { request });
  }

  if (req.method === 'POST' && url.pathname === '/api/content-strategy') {
    const body = await readBody(req);
    return sendJson(res, 200, buildContentStrategy(body));
  }

  const statusMatch = url.pathname.match(/^\/api\/research-requests\/([^/]+)\/status$/);
  if (req.method === 'PATCH' && statusMatch) {
    const body = await readBody(req);
    const nextStatus = cleanString(body.status);
    if (!['new', 'progress', 'blocked', 'done'].includes(nextStatus)) {
      return sendError(res, 400, 'Status must be one of: new, progress, blocked, done.');
    }

    const requests = await readRequests();
    const index = requests.findIndex(request => request.id === statusMatch[1]);
    if (index === -1) {
      return sendError(res, 404, 'Request not found.');
    }

    requests[index] = { ...requests[index], status: nextStatus, updatedAt: new Date().toISOString() };
    await writeRequests(requests);
    return sendJson(res, 200, { request: requests[index] });
  }

  return sendError(res, 404, 'API route not found.');
}

async function serveStatic(req, res, url) {
  const requestedPath = url.pathname === '/'
    ? '/index.html'
    : url.pathname === '/content-agent'
      ? '/content-agent.html'
      : decodeURIComponent(url.pathname);
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const file = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    res.end(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendError(res, 500, error.message || 'Internal server error.');
  }
});

server.listen(PORT, () => {
  console.log(`Proplr portfolio API running at http://localhost:${PORT}`);
});

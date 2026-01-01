import fastify from 'fastify';
import dotenv from 'dotenv';
import rateLimit from '@fastify/rate-limit';
import validateAddressRoutes from './routes/validateAddress.js';

dotenv.config();

const {
  PORT,
  RATE_LIMIT_ENABLED,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  X_API_KEY,
} = process.env;

const server = fastify({ logger: true });

// Per-IP rate limiting (using @fastify/rate-limit).
// Disable by setting RATE_LIMIT_ENABLED=false.
if (RATE_LIMIT_ENABLED === 'true') {
  server.register(rateLimit, {
    max: Number(RATE_LIMIT_MAX ?? 60), // Defaults to 60 req/min per IP.
    timeWindow: Number(RATE_LIMIT_WINDOW_MS ?? 60_000), // Defaults to 1 minute.
    addHeaders: {
      'retry-after': true,
    },
  });
}

if (!X_API_KEY) {
  server.log.warn(
    'X_API_KEY is not set; API key auth is disabled (all requests allowed)',
  );
}

// Simple API key gate to reduce unwanted traffic.
// Disabled if X_API_KEY is not set.
// - Clients must send: X-API-Key: <X_API_KEY>
// - /health is intentionally left open for basic uptime checks.
server.addHook('onRequest', async (request, reply) => {
  if (!X_API_KEY) return;

  const path = (request.raw.url || '').split('?')[0];
  if (path === '/health') return;

  const headerValue = request.headers['x-api-key'];
  const providedApiKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!providedApiKey || providedApiKey !== X_API_KEY) {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'invalid or missing X-API-Key',
    });
  }
});

// Ensure we accept plain text payloads for the free-form address input.
server.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});

server.register(validateAddressRoutes, { prefix: '/' });

server.get(
  '/health',
  {
    config: {
      rateLimit: false,
    },
  },
  async () => ({ status: 'ok' }),
);

const port = PORT ? Number(PORT) : 3000;

server
  .listen({ port, host: '0.0.0.0' })
  .catch((err) => {
    server.log.error(err);
    process.exit(1);
  });


import fastify from 'fastify';
import dotenv from 'dotenv';
import validateAddressRoutes from './routes/validateAddress.js';

dotenv.config();

const server = fastify({ logger: true });

const requiredApiKey = process.env.X_API_KEY;
if (!requiredApiKey) {
  server.log.warn(
    'X_API_KEY is not set; API key auth is disabled (all requests allowed)',
  );
}

// Simple API key gate to reduce unwanted traffic.
// Disabled if X_API_KEY is not set.
// - Clients must send: X-API-Key: <X_API_KEY>
// - /health is intentionally left open for basic uptime checks.
server.addHook('onRequest', async (request, reply) => {
  if (!requiredApiKey) return;

  const path = (request.raw.url || '').split('?')[0];
  if (path === '/health') return;

  const headerValue = request.headers['x-api-key'];
  const providedApiKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!providedApiKey || providedApiKey !== requiredApiKey) {
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

server.get('/health', async () => ({ status: 'ok' }));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

server
  .listen({ port, host: '0.0.0.0' })
  .catch((err) => {
    server.log.error(err);
    process.exit(1);
  });


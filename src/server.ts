import fastify from 'fastify';
import dotenv from 'dotenv';
import validateAddressRoutes from './routes/validateAddress.js';

dotenv.config();

const server = fastify({ logger: true });

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


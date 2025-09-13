/**
 * Routes registration for Fastify
 */

import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.routes';
import { vaultRoutes } from './vault.routes';
import { webauthnRoutes } from './webauthn.routes';

/**
 * Register all routes with the Fastify instance
 */
export function registerRoutes(server: FastifyInstance): void {
  // Register health check route
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  // Register API routes
  server.register(userRoutes, { prefix: '/api/users' });
  server.register(vaultRoutes, { prefix: '/api/vault' });
  server.register(webauthnRoutes, { prefix: '/api/webauthn' });
}
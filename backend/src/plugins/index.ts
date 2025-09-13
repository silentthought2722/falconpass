/**
 * Plugins registration for Fastify
 */

import { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import { config } from '../config';

/**
 * Register all plugins with the Fastify instance
 */
export async function registerPlugins(server: FastifyInstance): Promise<void> {
  // Register CORS
  await server.register(fastifyCors, {
    origin: config.origin,
    credentials: true,
  });

  // Register Cookie plugin
  await server.register(fastifyCookie, {
    secret: config.cookieSecret,
    hook: 'onRequest',
  });

  // Register JWT plugin
  await server.register(fastifyJwt, {
    secret: config.jwtSecret,
    cookie: {
      cookieName: 'token',
      signed: true,
    },
  });

  // Register Swagger plugin for API documentation
  await server.register(fastifySwagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'FalconPass API',
        description: 'API documentation for FalconPass password manager',
        version: '0.1.0',
      },
      externalDocs: {
        url: 'https://github.com/yourusername/falcon-pass',
        description: 'Find more info here',
      },
      host: `${config.host}:${config.port}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
    exposeRoute: true,
  });

  // Add JWT verification decorator
  server.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}
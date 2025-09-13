/**
 * FalconPass Backend Server
 * 
 * Main entry point for the Fastify server
 */

import { fastify } from 'fastify';
import { config } from './config';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';

// Create Fastify instance
const server = fastify({
  logger: {
    level: config.logLevel,
    transport: config.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

// Register plugins and routes
const start = async () => {
  try {
    // Register all plugins
    await registerPlugins(server);
    
    // Register all routes
    registerRoutes(server);
    
    // Start the server
    await server.listen({ port: config.port, host: config.host });
    
    console.log(`Server is running on ${config.host}:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Start the server
start();
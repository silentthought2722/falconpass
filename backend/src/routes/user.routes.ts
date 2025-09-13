/**
 * User routes for authentication and user management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UserService } from '../services/user.service';

// Request type with user payload
interface AuthRequest extends FastifyRequest {
  body: {
    email: string;
    username?: string;
    clientSalt?: string;
    verifier?: string;
    authResponse?: {
      clientProof: string;
      clientEphemeral: string;
    };
  };
}

// User routes plugin
export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Initialize user service
  const userService = new UserService();

  // Validation schemas
  const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(50),
    clientSalt: z.string(),
    verifier: z.string(),
  });

  const loginChallengeSchema = z.object({
    email: z.string().email(),
  });

  const loginVerifySchema = z.object({
    email: z.string().email(),
    authResponse: z.object({
      clientProof: z.string(),
      clientEphemeral: z.string(),
    }),
  });

  // Register a new user
  fastify.post('/register', async (request: AuthRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const validation = registerSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: validation.error });
      }

      const { email, username, clientSalt, verifier } = request.body;

      // Register the user
      const result = await userService.registerUser({
        email,
        username: username!,
        clientSalt: clientSalt!,
        verifier: verifier!,
      });

      return reply.code(201).send(result);
    } catch (error: any) {
      fastify.log.error(error);
      if (error.message === 'User already exists') {
        return reply.code(409).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Request login challenge
  fastify.post('/login/challenge', async (request: AuthRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const validation = loginChallengeSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: validation.error });
      }

      const { email } = request.body;

      // Get login challenge
      const challenge = await userService.getLoginChallenge(email);
      return reply.send(challenge);
    } catch (error: any) {
      fastify.log.error(error);
      if (error.message === 'User not found') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Verify login and issue token
  fastify.post('/login/verify', async (request: AuthRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const validation = loginVerifySchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: validation.error });
      }

      const { email, authResponse } = request.body;

      // Verify login
      const result = await userService.verifyLogin(email, authResponse!);

      // Set JWT token in cookie
      reply.setCookie('token', result.token, {
        path: '/',
        httpOnly: true,
        secure: fastify.config.isProduction,
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
      });

      return reply.send({ userId: result.userId, username: result.username });
    } catch (error: any) {
      fastify.log.error(error);
      if (error.message === 'Invalid credentials') {
        return reply.code(401).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Logout user
  fastify.post('/logout', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.send({ success: true });
  });

  // Get current user
  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId;
      const user = await userService.getUserById(userId);
      return reply.send(user);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
/**
 * WebAuthn routes for two-factor authentication
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebAuthnService } from '../services/webauthn.service';

// WebAuthn routes plugin
export async function webauthnRoutes(fastify: FastifyInstance): Promise<void> {
  // Initialize WebAuthn service
  const webAuthnService = new WebAuthnService();

  // Generate registration options
  fastify.post('/register/options', { onRequest: [fastify.authenticate] }, async (request, reply: FastifyReply) => {
    try {
      const userId = request.user.sub;
      const options = await webAuthnService.generateRegistrationOptions(userId);
      return reply.send(options);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Verify registration
  fastify.post('/register/verify', { onRequest: [fastify.authenticate] }, async (request: FastifyRequest<{ Body: { credential: any } }>, reply: FastifyReply) => {
    try {
      const userId = request.user.sub;
      const { credential } = request.body;

      const verification = await webAuthnService.verifyRegistration(userId, credential);
      return reply.send(verification);
    } catch (error: any) {
      fastify.log.error(error);
      if (error.message === 'Invalid credential') {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Generate authentication options
  fastify.post('/login/options', async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
    try {
      const { email } = request.body;
      const options = await webAuthnService.generateAuthenticationOptions(email);
      return reply.send(options);
    } catch (error: any) {
      fastify.log.error(error);
      if (error.message === 'User not found' || error.message === 'No registered credentials') {
        return reply.code(404).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Verify authentication
  fastify.post('/login/verify', async (request: FastifyRequest<{ Body: { email: string; credential: any } }>, reply: FastifyReply) => {
    try {
      const { email, credential } = request.body;

      const verification = await webAuthnService.verifyAuthentication(email, credential);
      
      if (verification.verified) {
        // Set JWT token in cookie
        reply.setCookie('token', verification.token, {
          path: '/',
          httpOnly: true,
          secure: fastify.config.isProduction,
          sameSite: 'strict',
          maxAge: 3600, // 1 hour
        });

        return reply.send({ userId: verification.userId, username: verification.username });
      } else {
        return reply.code(401).send({ error: 'Authentication failed' });
      }
    } catch (error: any) {
      fastify.log.error(error);
      if (error.message === 'Invalid credential') {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get registered credentials
  fastify.get('/credentials', { onRequest: [fastify.authenticate] }, async (request, reply: FastifyReply) => {
    try {
      const userId = request.user.sub;
      const credentials = await webAuthnService.getCredentialsByUserId(userId);
      return reply.send(credentials);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete a credential
  fastify.delete('/credentials/:id', { onRequest: [fastify.authenticate] }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userId = request.user.sub;
      const credentialId = request.params.id;

      const deleted = await webAuthnService.deleteCredential(credentialId, userId);
      if (!deleted) {
        return reply.code(404).send({ error: 'Credential not found' });
      }

      return reply.send({ success: true });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
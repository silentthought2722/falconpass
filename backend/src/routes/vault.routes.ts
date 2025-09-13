/**
 * Vault routes for managing password entries
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { VaultService } from '../services/vault.service';

// Request type with vault entry payload
interface VaultRequest extends FastifyRequest {
  body: {
    id?: string;
    encryptedData: string;
    metadata?: {
      title?: string;
      url?: string;
      category?: string;
      tags?: string[];
      lastModified?: string;
    };
  };
}

// Vault routes plugin
export async function vaultRoutes(fastify: FastifyInstance): Promise<void> {
  // Initialize vault service
  const vaultService = new VaultService();

  // Validation schemas
  const createEntrySchema = z.object({
    encryptedData: z.string(),
    metadata: z.object({
      title: z.string().optional(),
      url: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      lastModified: z.string().optional(),
    }).optional(),
  });

  const updateEntrySchema = z.object({
    id: z.string().uuid(),
    encryptedData: z.string(),
    metadata: z.object({
      title: z.string().optional(),
      url: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      lastModified: z.string().optional(),
    }).optional(),
  });

  // Middleware to authenticate all vault routes
  fastify.addHook('onRequest', fastify.authenticate);

  // Get all vault entries for the user
  fastify.get('/', async (request, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const entries = await vaultService.getEntriesByUserId(userId);
      return reply.send(entries);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get a specific vault entry
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const entryId = request.params.id;
      
      const entry = await vaultService.getEntryById(entryId, userId);
      if (!entry) {
        return reply.code(404).send({ error: 'Entry not found' });
      }
      
      return reply.send(entry);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new vault entry
  fastify.post('/', async (request: VaultRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const validation = createEntrySchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: validation.error });
      }

      const userId = (request as any).user.userId;
      const { encryptedData, metadata } = request.body;

      const entry = await vaultService.createEntry({
        userId,
        encryptedData,
        metadata: metadata || {},
      });

      return reply.code(201).send(entry);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update a vault entry
  fastify.put('/:id', async (request: VaultRequest & { Params: { id: string } }, reply: FastifyReply) => {
    try {
      // Validate request body
      const validation = updateEntrySchema.safeParse({
        ...request.body,
        id: request.params.id,
      });
      if (!validation.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: validation.error });
      }

      const userId = (request as any).user.userId;
      const entryId = request.params.id;
      const { encryptedData, metadata } = request.body;

      const updated = await vaultService.updateEntry(entryId, {
        userId,
        encryptedData,
        metadata: metadata || {},
      });

      if (!updated) {
        return reply.code(404).send({ error: 'Entry not found' });
      }

      return reply.send({ success: true, id: entryId });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete a vault entry
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const entryId = request.params.id;

      const deleted = await vaultService.deleteEntry(entryId, userId);
      if (!deleted) {
        return reply.code(404).send({ error: 'Entry not found' });
      }

      return reply.send({ success: true });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Bulk export vault entries (encrypted)
  fastify.get('/export', async (request, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const exportData = await vaultService.exportVault(userId);
      return reply.send(exportData);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Bulk import vault entries (encrypted)
  fastify.post('/import', async (request: FastifyRequest<{ Body: { entries: any[] } }>, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { entries } = request.body;

      if (!Array.isArray(entries)) {
        return reply.code(400).send({ error: 'Invalid import data' });
      }

      const result = await vaultService.importVault(userId, entries);
      return reply.send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
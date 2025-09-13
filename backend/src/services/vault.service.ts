/**
 * Vault service for managing password entries
 */

import { VaultEntryDTO, VaultEntryCreateData, VaultEntryUpdateData, VaultExportData, VaultImportResult } from '../types';
import { VaultEntryModel } from '../models';

export class VaultService {
  /**
   * Get all vault entries for a user
   */
  async getEntriesByUserId(userId: string): Promise<VaultEntryDTO[]> {
    return VaultEntryModel.getDTOsByUserId(userId);
  }

  /**
   * Get a specific vault entry
   */
  async getEntryById(entryId: string, userId: string): Promise<VaultEntryDTO | null> {
    return VaultEntryModel.getDTOById(entryId, userId);
  }

  /**
   * Create a new vault entry
   */
  async createEntry(data: VaultEntryCreateData): Promise<VaultEntryDTO> {
    return VaultEntryModel.create(data);
  }

  /**
   * Update a vault entry
   */
  async updateEntry(entryId: string, data: VaultEntryUpdateData): Promise<boolean> {
    return VaultEntryModel.update(entryId, data);
  }

  /**
   * Delete a vault entry
   */
  async deleteEntry(entryId: string, userId: string): Promise<boolean> {
    return VaultEntryModel.delete(entryId, userId);
  }

  /**
   * Export vault entries
   */
  async exportEntries(userId: string): Promise<VaultExportData> {
    const entries = await VaultEntryModel.getDTOsByUserId(userId);
    
    return {
      format: 'falconpass-v1',
      timestamp: new Date().toISOString(),
      entries,
    };
  }

  /**
   * Import vault entries
   */
  async importEntries(userId: string, importData: VaultExportData): Promise<VaultImportResult> {
    // Validate import format
    if (importData.format !== 'falconpass-v1') {
      throw new Error('Unsupported import format');
    }
    
    // Track import results
    const result: VaultImportResult = {
      total: importData.entries.length,
      imported: 0,
      skipped: 0,
      errors: 0,
    };
    
    // Process each entry
    for (const entry of importData.entries) {
      try {
        await VaultEntryModel.create({
          userId,
          encryptedData: entry.encryptedData,
          metadata: entry.metadata,
        });
        
        result.imported++;
      } catch (error) {
        result.errors++;
      }
    }
    
    return result;
  }
}
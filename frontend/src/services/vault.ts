/**
 * Vault Service
 * 
 * Handles CRUD operations for vault entries with client-side encryption:
 * - All sensitive data is encrypted before sending to server
 * - Uses XChaCha20-Poly1305 for authenticated encryption
 * - Supports import/export of encrypted vault data
 */

import { apiService } from './api';
import {
  encryptData,
  decryptData,
  serializeEncryptedData,
  deserializeEncryptedData
} from '../crypto';
import type {
  VaultEntry,
  EncryptedVaultEntry,
  ApiResponse
} from '../types';

/**
 * Encrypt a vault entry using the provided encryption key
 * @param entry The vault entry to encrypt
 * @param key The encryption key
 * @param salt The salt used for key derivation
 * @returns Encrypted vault entry
 */
export function encryptVaultEntry(
  entry: VaultEntry,
  key: Uint8Array,
  salt: Uint8Array
): EncryptedVaultEntry {
  // Convert entry to JSON string
  const entryJson = JSON.stringify(entry);
  
  // Encrypt the data
  const { ciphertext, nonce } = encryptData(entryJson, key);
  
  // Serialize for storage
  const encryptedData = serializeEncryptedData(ciphertext, nonce, salt);
  
  return {
    id: entry.id,
    encryptedData,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

/**
 * Decrypt a vault entry using the provided encryption key
 * @param encryptedEntry The encrypted vault entry
 * @param key The encryption key
 * @returns Decrypted vault entry
 */
export function decryptVaultEntry(
  encryptedEntry: EncryptedVaultEntry,
  key: Uint8Array
): VaultEntry {
  try {
    // Deserialize the encrypted data
    const { ciphertext, nonce } = deserializeEncryptedData(encryptedEntry.encryptedData);
    
    // Decrypt the data
    const decryptedJson = decryptData(ciphertext, nonce, key);
    
    // Parse the JSON
    const entry = JSON.parse(decryptedJson) as VaultEntry;
    
    return {
      ...entry,
      id: encryptedEntry.id,
      createdAt: encryptedEntry.createdAt,
      updatedAt: encryptedEntry.updatedAt,
    };
  } catch (error) {
    throw new Error('Failed to decrypt vault entry');
  }
}

/**
 * Get all vault entries
 * @param key The encryption key
 * @returns List of decrypted vault entries
 */
export async function getVaultEntries(key: Uint8Array): Promise<VaultEntry[]> {
  try {
    const response = await apiService.getVaultEntries();
    
    if (response.error || !response.data) {
      return [];
    }
    
    // Decrypt all entries
    return response.data.map(encryptedEntry => {
      try {
        return decryptVaultEntry({
          id: encryptedEntry.id,
          encryptedData: encryptedEntry.encryptedData,
          createdAt: encryptedEntry.createdAt,
          updatedAt: encryptedEntry.updatedAt,
        }, key);
      } catch (error) {
        console.error('Failed to decrypt entry:', encryptedEntry.id, error);
        // Return a placeholder for entries that couldn't be decrypted
        return {
          id: encryptedEntry.id,
          name: '🔒 Encrypted Entry',
          favorite: false,
          createdAt: encryptedEntry.createdAt,
          updatedAt: encryptedEntry.updatedAt,
        };
      }
    });
  } catch (error) {
    console.error('Failed to get vault entries:', error);
    return [];
  }
}

/**
 * Get a single vault entry by ID
 * @param id Entry ID
 * @param key The encryption key
 * @returns Decrypted vault entry
 */
export async function getVaultEntry(id: string, key: Uint8Array): Promise<VaultEntry | null> {
  try {
    const response = await apiService.getVaultEntry(id);
    
    if (response.error || !response.data) {
      return null;
    }
    
    return decryptVaultEntry({
      id: response.data.id,
      encryptedData: response.data.encryptedData,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
    }, key);
  } catch (error) {
    console.error(`Failed to get vault entry ${id}:`, error);
    return null;
  }
}

/**
 * Create a new vault entry
 * @param entry The vault entry to create
 * @param key The encryption key
 * @param salt The salt used for key derivation
 * @returns The created vault entry
 */
export async function createVaultEntry(
  entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>,
  key: Uint8Array,
  salt: Uint8Array
): Promise<VaultEntry> {
  try {
    // Create a temporary entry with placeholder values for encryption
    const tempEntry: VaultEntry = {
      ...entry,
      id: 'temp-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Encrypt the entry
    const encryptedEntry = encryptVaultEntry(tempEntry, key, salt);
    
    // Send only the encrypted data to the server
    const response = await apiService.createVaultEntry({
      encryptedData: encryptedEntry.encryptedData,
      metadata: {
        title: entry.name,
        url: entry.url,
        category: entry.category,
        tags: entry.tags,
        lastModified: new Date().toISOString(),
      },
    });
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create vault entry');
    }
    
    // Return the original entry with the new ID
    return {
      ...entry,
      id: response.data.id,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing vault entry
 * @param id Entry ID
 * @param entry The updated vault entry
 * @param key The encryption key
 * @param salt The salt used for key derivation
 * @returns The updated vault entry
 */
export async function updateVaultEntry(
  id: string,
  entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>,
  key: Uint8Array,
  salt: Uint8Array
): Promise<VaultEntry> {
  try {
    // Create a temporary entry with the ID and placeholder timestamps
    const tempEntry: VaultEntry = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Encrypt the entry
    const encryptedEntry = encryptVaultEntry(tempEntry, key, salt);
    
    // Send only the encrypted data to the server
    const response = await apiService.updateVaultEntry(id, {
      encryptedData: encryptedEntry.encryptedData,
      metadata: {
        title: entry.name,
        url: entry.url,
        category: entry.category,
        tags: entry.tags,
        lastModified: new Date().toISOString(),
      },
    });
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update vault entry');
    }
    
    // Return the updated entry
    return {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a vault entry
 * @param id Entry ID
 * @returns Success status
 */
export async function deleteVaultEntry(id: string): Promise<boolean> {
  try {
    const response = await apiService.deleteVaultEntry(id);
    
    return !response.error;
  } catch (error) {
    console.error(`Failed to delete vault entry ${id}:`, error);
    return false;
  }
}

/**
 * Export vault data as encrypted JSON
 * @param entries Vault entries to export
 * @param key The encryption key
 * @param salt The salt used for key derivation
 * @returns JSON string of encrypted vault data
 */
export function exportVault(
  entries: VaultEntry[],
  key: Uint8Array,
  salt: Uint8Array
): string {
  // Encrypt each entry
  const encryptedEntries = entries.map(entry => encryptVaultEntry(entry, key, salt));
  
  // Create export object with metadata
  const exportData = {
    format: 'falconpass-export',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    entries: encryptedEntries,
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import vault data from encrypted JSON
 * @param jsonData JSON string of encrypted vault data
 * @param key The encryption key
 * @returns List of decrypted vault entries
 */
export function importVault(jsonData: string, key: Uint8Array): VaultEntry[] {
  try {
    // Parse the JSON
    const importData = JSON.parse(jsonData);
    
    // Validate format
    if (importData.format !== 'falconpass-export') {
      throw new Error('Invalid export format');
    }
    
    // Decrypt each entry
    return importData.entries.map((encryptedEntry: EncryptedVaultEntry) => {
      try {
        return decryptVaultEntry(encryptedEntry, key);
      } catch (error) {
        console.error('Failed to decrypt entry during import:', encryptedEntry.id, error);
        // Return a placeholder for entries that couldn't be decrypted
        return {
          id: encryptedEntry.id || 'unknown',
          name: '🔒 Encrypted Import Entry',
          favorite: false,
          createdAt: encryptedEntry.createdAt || new Date().toISOString(),
          updatedAt: encryptedEntry.updatedAt || new Date().toISOString(),
        };
      }
    });
  } catch (error) {
    console.error('Failed to import vault:', error);
    throw new Error('Failed to import vault: Invalid format');
  }
}

/**
 * Import vault entries from encrypted JSON file
 * @param entries Entries to import
 * @param key The encryption key
 * @param salt The salt used for key derivation
 * @returns List of created vault entries
 */
export async function importVaultEntries(
  entries: VaultEntry[],
  key: Uint8Array,
  salt: Uint8Array
): Promise<VaultEntry[]> {
  try {
    // Encrypt each entry
    const encryptedEntries = entries.map(entry => {
      // Create a temporary entry with placeholder values
      const tempEntry: VaultEntry = {
        ...entry,
        id: 'temp-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Encrypt and return only the encrypted data
      const encrypted = encryptVaultEntry(tempEntry, key, salt);
      return encrypted.encryptedData;
    });
    
    // Send to server
    const response = await apiService.importVault(encryptedEntries);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to import vault entries');
    }
    
    // Return the original entries (the server doesn't return the decrypted data)
    return entries;
  } catch (error) {
    throw error;
  }
}
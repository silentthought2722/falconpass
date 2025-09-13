/**
 * Database models for the FalconPass backend
 */

import knex from 'knex';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  UserDTO,
  WebAuthnCredential,
  WebAuthnCredentialDTO,
  VaultEntry,
  VaultEntryDTO,
  DatabaseUser,
  DatabaseWebAuthnCredential,
  DatabaseVaultEntry,
  UserRegistrationData,
  VaultEntryCreateData,
  VaultEntryUpdateData,
} from '../types';
import { safeJsonParse, safeJsonStringify, snakeToCamel, camelToSnake } from '../utils';

// Initialize Knex with configuration
const db = knex(config.dbConfig);

/**
 * User model for database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: UserRegistrationData): Promise<string> {
    const id = uuidv4();
    
    await db('users').insert({
      id,
      email: userData.email,
      username: userData.username,
      client_salt: userData.clientSalt,
      verifier: userData.verifier,
    });
    
    return id;
  }
  
  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<User | null> {
    const user = await db('users').where({ id }).first();
    
    if (!user) {
      return null;
    }
    
    return this.mapDatabaseUserToUser(user as DatabaseUser);
  }
  
  /**
   * Get user by email
   */
  static async getByEmail(email: string): Promise<User | null> {
    const user = await db('users').where({ email }).first();
    
    if (!user) {
      return null;
    }
    
    return this.mapDatabaseUserToUser(user as DatabaseUser);
  }
  
  /**
   * Get user DTO by ID
   */
  static async getDTOById(id: string): Promise<UserDTO | null> {
    const user = await this.getById(id);
    
    if (!user) {
      return null;
    }
    
    // Check if user has WebAuthn credentials
    const hasWebAuthn = await db('webauthn_credentials')
      .where({ user_id: id })
      .first()
      .then(result => !!result);
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      hasWebAuthn,
    };
  }
  
  /**
   * Update user
   */
  static async update(id: string, userData: Partial<User>): Promise<boolean> {
    const updateData = camelToSnake(userData);
    delete (updateData as any).id; // Prevent ID update
    
    const updated = await db('users')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date(),
      });
    
    return updated > 0;
  }
  
  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const deleted = await db('users').where({ id }).delete();
    return deleted > 0;
  }
  
  /**
   * Map database user to user model
   */
  private static mapDatabaseUserToUser(dbUser: DatabaseUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      clientSalt: dbUser.client_salt,
      verifier: dbUser.verifier,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}

/**
 * WebAuthn credential model for database operations
 */
export class WebAuthnCredentialModel {
  /**
   * Create a new WebAuthn credential
   */
  static async create(credential: Omit<WebAuthnCredential, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = uuidv4();
    
    await db('webauthn_credentials').insert({
      id,
      user_id: credential.userId,
      credential_id: credential.credentialId,
      public_key: credential.publicKey,
      counter: credential.counter,
      credential_device_type: credential.credentialDeviceType,
      credential_backed_up: credential.credentialBackedUp,
      transports: credential.transports,
    });
    
    return id;
  }
  
  /**
   * Get credential by ID
   */
  static async getById(id: string): Promise<WebAuthnCredential | null> {
    const credential = await db('webauthn_credentials').where({ id }).first();
    
    if (!credential) {
      return null;
    }
    
    return this.mapDatabaseCredentialToCredential(credential as DatabaseWebAuthnCredential);
  }
  
  /**
   * Get credential by credential ID
   */
  static async getByCredentialId(credentialId: string): Promise<WebAuthnCredential | null> {
    const credential = await db('webauthn_credentials').where({ credential_id: credentialId }).first();
    
    if (!credential) {
      return null;
    }
    
    return this.mapDatabaseCredentialToCredential(credential as DatabaseWebAuthnCredential);
  }
  
  /**
   * Get credentials by user ID
   */
  static async getByUserId(userId: string): Promise<WebAuthnCredential[]> {
    const credentials = await db('webauthn_credentials').where({ user_id: userId });
    
    return credentials.map(credential => 
      this.mapDatabaseCredentialToCredential(credential as DatabaseWebAuthnCredential)
    );
  }
  
  /**
   * Get credential DTOs by user ID
   */
  static async getDTOsByUserId(userId: string): Promise<WebAuthnCredentialDTO[]> {
    const credentials = await this.getByUserId(userId);
    
    return credentials.map(credential => ({
      id: credential.id,
      credentialId: credential.credentialId,
      credentialDeviceType: credential.credentialDeviceType,
      credentialBackedUp: credential.credentialBackedUp,
      createdAt: credential.createdAt.toISOString(),
    }));
  }
  
  /**
   * Update credential
   */
  static async update(id: string, data: Partial<WebAuthnCredential>): Promise<boolean> {
    const updateData = camelToSnake(data);
    delete (updateData as any).id; // Prevent ID update
    delete (updateData as any).user_id; // Prevent user ID update
    
    const updated = await db('webauthn_credentials')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date(),
      });
    
    return updated > 0;
  }
  
  /**
   * Delete credential
   */
  static async delete(id: string): Promise<boolean> {
    const deleted = await db('webauthn_credentials').where({ id }).delete();
    return deleted > 0;
  }
  
  /**
   * Map database credential to credential model
   */
  private static mapDatabaseCredentialToCredential(dbCredential: DatabaseWebAuthnCredential): WebAuthnCredential {
    return {
      id: dbCredential.id,
      userId: dbCredential.user_id,
      credentialId: dbCredential.credential_id,
      publicKey: dbCredential.public_key,
      counter: dbCredential.counter,
      credentialDeviceType: dbCredential.credential_device_type,
      credentialBackedUp: dbCredential.credential_backed_up,
      transports: dbCredential.transports,
      createdAt: dbCredential.created_at,
      updatedAt: dbCredential.updated_at,
    };
  }
}

/**
 * Vault entry model for database operations
 */
export class VaultEntryModel {
  /**
   * Create a new vault entry
   */
  static async create(entryData: VaultEntryCreateData): Promise<VaultEntryDTO> {
    const id = uuidv4();
    const now = new Date();
    
    await db('vault_entries').insert({
      id,
      user_id: entryData.userId,
      encrypted_data: entryData.encryptedData,
      metadata: safeJsonStringify(entryData.metadata),
      created_at: now,
      updated_at: now,
    });
    
    return {
      id,
      encryptedData: entryData.encryptedData,
      metadata: entryData.metadata,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }
  
  /**
   * Get entry by ID
   */
  static async getById(id: string, userId: string): Promise<VaultEntry | null> {
    const entry = await db('vault_entries')
      .where({ id, user_id: userId })
      .first();
    
    if (!entry) {
      return null;
    }
    
    return this.mapDatabaseEntryToEntry(entry as DatabaseVaultEntry);
  }
  
  /**
   * Get entry DTO by ID
   */
  static async getDTOById(id: string, userId: string): Promise<VaultEntryDTO | null> {
    const entry = await this.getById(id, userId);
    
    if (!entry) {
      return null;
    }
    
    return {
      id: entry.id,
      encryptedData: entry.encryptedData,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
  
  /**
   * Get entries by user ID
   */
  static async getByUserId(userId: string): Promise<VaultEntry[]> {
    const entries = await db('vault_entries').where({ user_id: userId });
    
    return entries.map(entry => 
      this.mapDatabaseEntryToEntry(entry as DatabaseVaultEntry)
    );
  }
  
  /**
   * Get entry DTOs by user ID
   */
  static async getDTOsByUserId(userId: string): Promise<VaultEntryDTO[]> {
    const entries = await this.getByUserId(userId);
    
    return entries.map(entry => ({
      id: entry.id,
      encryptedData: entry.encryptedData,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));
  }
  
  /**
   * Update entry
   */
  static async update(id: string, entryData: VaultEntryUpdateData): Promise<boolean> {
    const updated = await db('vault_entries')
      .where({ id, user_id: entryData.userId })
      .update({
        encrypted_data: entryData.encryptedData,
        metadata: safeJsonStringify(entryData.metadata),
        updated_at: new Date(),
      });
    
    return updated > 0;
  }
  
  /**
   * Delete entry
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const deleted = await db('vault_entries')
      .where({ id, user_id: userId })
      .delete();
    
    return deleted > 0;
  }
  
  /**
   * Map database entry to entry model
   */
  private static mapDatabaseEntryToEntry(dbEntry: DatabaseVaultEntry): VaultEntry {
    return {
      id: dbEntry.id,
      userId: dbEntry.user_id,
      encryptedData: dbEntry.encrypted_data,
      metadata: safeJsonParse(dbEntry.metadata, {}),
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at,
    };
  }
}
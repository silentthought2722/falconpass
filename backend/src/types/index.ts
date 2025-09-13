/**
 * Type definitions for the FalconPass backend
 */

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  clientSalt: string;
  verifier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  hasWebAuthn: boolean;
}

export interface UserRegistrationData {
  email: string;
  username: string;
  clientSalt: string;
  verifier: string;
}

// Authentication types
export interface AuthChallenge {
  serverEphemeral: string;
  salt: string;
}

export interface AuthResponse {
  clientProof: string;
  clientEphemeral: string;
}

export interface AuthResult {
  userId: string;
  username: string;
  token: string;
}

// WebAuthn types
export interface WebAuthnCredential {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WebAuthnCredentialDTO {
  id: string;
  credentialId: string;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  createdAt: string;
}

// Vault types
export interface VaultEntry {
  id: string;
  userId: string;
  encryptedData: string;
  metadata: VaultEntryMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultEntryDTO {
  id: string;
  encryptedData: string;
  metadata: VaultEntryMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface VaultEntryMetadata {
  title?: string;
  url?: string;
  category?: string;
  tags?: string[];
  lastModified?: string;
}

export interface VaultEntryCreateData {
  userId: string;
  encryptedData: string;
  metadata: VaultEntryMetadata;
}

export interface VaultEntryUpdateData {
  userId: string;
  encryptedData: string;
  metadata: VaultEntryMetadata;
}

export interface VaultExportData {
  entries: VaultEntryDTO[];
  exportedAt: string;
}

export interface VaultImportResult {
  success: boolean;
  imported: number;
  failed: number;
}

// Database types
export interface DatabaseUser {
  id: string;
  email: string;
  username: string;
  client_salt: string;
  verifier: string;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseWebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  credential_device_type: string;
  credential_backed_up: boolean;
  transports?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseVaultEntry {
  id: string;
  user_id: string;
  encrypted_data: string;
  metadata: string; // JSON string
  created_at: Date;
  updated_at: Date;
}
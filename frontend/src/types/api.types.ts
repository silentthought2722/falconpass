/**
 * API Types for FalconPass Frontend
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: any;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultEntry {
  id: string;
  userId: string;
  encryptedData: string;
  metadata: {
    title?: string;
    url?: string;
    category?: string;
    tags?: string[];
    lastModified?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginChallenge {
  serverEphemeral: string;
  salt: string;
  iterations: number;
}

export interface AuthResponse {
  clientProof: string;
  clientEphemeral: string;
}

export interface LoginResult {
  userId: string;
  username: string;
  token: string;
}

// Vault entry interface for the frontend
export interface VaultEntryData {
  id?: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  lastModified?: string;
}

// Vault statistics
export interface VaultStats {
  totalPasswords: number;
  reused: number;
  weak: number;
  breached: number;
  securityScore: number;
}
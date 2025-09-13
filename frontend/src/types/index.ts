/**
 * FalconPass Type Definitions
 */

// User authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  hasWebAuthn: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthChallenge {
  challenge: string;
  salt: string;
}

export interface AuthResponse {
  response: string;
}

// WebAuthn types
export interface WebAuthnCredential {
  id: string;
  name: string;
  createdAt: string;
}

// Vault entry types
export interface VaultEntry {
  id: string;
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  category?: string;
  tags?: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedVaultEntry {
  id: string;
  encryptedData: string; // Base64 serialized encrypted data
  createdAt: string;
  updatedAt: string;
}

export interface VaultState {
  entries: VaultEntry[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTags: string[];
  selectedCategory: string | null;
  showFavoritesOnly: boolean;
}

// Settings types
export interface Settings {
  autoLockTimeout: number; // in minutes, 0 = never
  clearClipboardAfter: number; // in seconds, 0 = never
  theme: 'light' | 'dark' | 'system';
  defaultPasswordLength: number;
  defaultPasswordOptions: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export interface SettingsState extends Settings {
  isLoading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
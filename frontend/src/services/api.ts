/**
 * API Service for FalconPass Frontend
 * Handles all communication with the backend API
 */

// Import types from the types directory
import type { ApiResponse, User, VaultEntry, LoginChallenge, AuthResponse, LoginResult } from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Re-export types for convenience
export type { ApiResponse, User, VaultEntry, LoginChallenge, AuthResponse, LoginResult };

// Extend the LoginResult interface for additional properties
export interface LoginResultExtended extends LoginResult {
  username: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request('/health');
  }

  // ===== USER AUTHENTICATION =====

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    username: string;
    clientSalt: string;
    verifier: string;
  }): Promise<ApiResponse<{ userId: string; username: string }>> {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get login challenge
   */
  async getLoginChallenge(email: string): Promise<ApiResponse<LoginChallenge>> {
    return this.request('/api/users/login/challenge', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Verify login and get token
   */
  async verifyLogin(
    email: string,
    authResponse: AuthResponse
  ): Promise<ApiResponse<LoginResult>> {
    return this.request('/api/users/login/verify', {
      method: 'POST',
      body: JSON.stringify({ email, authResponse }),
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/api/users/logout', {
      method: 'POST',
    });
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/api/users/me');
  }

  // ===== VAULT MANAGEMENT =====

  /**
   * Get all vault entries
   */
  async getVaultEntries(): Promise<ApiResponse<VaultEntry[]>> {
    return this.request('/api/vault');
  }

  /**
   * Get specific vault entry
   */
  async getVaultEntry(id: string): Promise<ApiResponse<VaultEntry>> {
    return this.request(`/api/vault/${id}`);
  }

  /**
   * Create new vault entry
   */
  async createVaultEntry(data: {
    encryptedData: string;
    metadata?: {
      title?: string;
      url?: string;
      category?: string;
      tags?: string[];
      lastModified?: string;
    };
  }): Promise<ApiResponse<VaultEntry>> {
    return this.request('/api/vault', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update vault entry
   */
  async updateVaultEntry(
    id: string,
    data: {
      encryptedData: string;
      metadata?: {
        title?: string;
        url?: string;
        category?: string;
        tags?: string[];
        lastModified?: string;
      };
    }
  ): Promise<ApiResponse<{ success: boolean; id: string }>> {
    return this.request(`/api/vault/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete vault entry
   */
  async deleteVaultEntry(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/api/vault/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Export vault data
   */
  async exportVault(): Promise<ApiResponse<any[]>> {
    return this.request('/api/vault/export');
  }

  /**
   * Import vault data
   */
  async importVault(entries: any[]): Promise<ApiResponse<{ success: boolean; imported: number }>> {
    return this.request('/api/vault/import', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
  }

  // ===== WEBAUTHN (Future Implementation) =====

  /**
   * Get WebAuthn registration options
   */
  async getWebAuthnRegistrationOptions(): Promise<ApiResponse<any>> {
    return this.request('/api/webauthn/register/begin');
  }

  /**
   * Complete WebAuthn registration
   */
  async completeWebAuthnRegistration(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/webauthn/register/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get WebAuthn authentication options
   */
  async getWebAuthnAuthOptions(): Promise<ApiResponse<any>> {
    return this.request('/api/webauthn/auth/begin');
  }

  /**
   * Complete WebAuthn authentication
   */
  async completeWebAuthnAuth(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/webauthn/auth/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export type { User, VaultEntry, LoginChallenge, AuthResponse, LoginResult };

/**
 * Authentication Service for FalconPass Frontend
 * Handles SRP (Secure Remote Password) authentication
 */

import { apiService } from './api';
import type { LoginChallenge, AuthResponse } from '../types/api.types';
import { deriveKeyFromPassword } from '../crypto';

// SRP implementation (simplified for demo)
class AuthService {
  private isAuthenticated = false;
  private currentUser: { id: string; username: string } | null = null;

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): { id: string; username: string } | null {
    return this.currentUser;
  }

  /**
   * Set authentication state (for mock/development)
   */
  setAuthenticated(authenticated: boolean, user: { id: string; username: string } | null): void {
    this.isAuthenticated = authenticated;
    this.currentUser = user;
  }

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate client salt and verifier (simplified SRP)
      const clientSalt = this.generateSalt();
      const verifier = await this.generateVerifier(data.password, clientSalt);

      const response = await apiService.register({
        email: data.email,
        username: data.username,
        clientSalt: this.arrayToBase64(clientSalt),
        verifier: this.arrayToBase64(verifier),
      });

      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Step 1: Get login challenge
      const challengeResponse = await apiService.getLoginChallenge(email);
      if (challengeResponse.error) {
        return { success: false, error: challengeResponse.error };
      }

      const challenge = challengeResponse.data!;

      // Step 2: Generate client response (simplified SRP)
      const authResponse = await this.generateAuthResponse(password, challenge);

      // Step 3: Verify login
      const verifyResponse = await apiService.verifyLogin(email, authResponse);
      if (verifyResponse.error) {
        return { success: false, error: verifyResponse.error };
      }

      // Set authentication state
      this.isAuthenticated = true;
      this.currentUser = verifyResponse.data!;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isAuthenticated = false;
      this.currentUser = null;
    }
  }

  /**
   * Get current user info from server
   */
  async getCurrentUserInfo(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await apiService.getCurrentUser();
      if (response.error) {
        return { success: false, error: response.error };
      }

      return { success: true, user: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user info' 
      };
    }
  }

  /**
   * Generate salt for SRP
   */
  private generateSalt(): Uint8Array {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return salt;
  }

  /**
   * Generate verifier for SRP registration
   */
  private async generateVerifier(password: string, salt: Uint8Array): Promise<Uint8Array> {
    // In a real implementation, this would use SRP's verifier generation
    // For demo purposes, we'll use Argon2id
    const { key } = await deriveKeyFromPassword(password, salt);
    return key;
  }

  /**
   * Generate authentication response for SRP login
   */
  private async generateAuthResponse(
    password: string, 
    challenge: LoginChallenge
  ): Promise<AuthResponse> {
    // In a real implementation, this would use SRP's client proof generation
    // For demo purposes, we'll create a simple response
    const salt = this.base64ToArray(challenge.salt);
    const { key } = await deriveKeyFromPassword(password, salt);
    
    return {
      clientProof: this.arrayToBase64(key),
      clientEphemeral: this.arrayToBase64(new Uint8Array(32)),
    };
  }

  /**
   * Convert Uint8Array to Base64
   */
  private arrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Convert Base64 to Uint8Array
   */
  private base64ToArray(base64: string): Uint8Array {
    const binary = atob(base64);
    return new Uint8Array(binary.length).map((_, i) => binary.charCodeAt(i));
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await apiService.healthCheck();
      return !response.error;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

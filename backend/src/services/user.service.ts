/**
 * User service for authentication and user management
 */

import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { User, UserDTO, UserRegistrationData, AuthChallenge, AuthResponse, AuthResult } from '../types';
import { config } from '../config';
import { UserModel } from '../models';

// Store active challenges in memory
const challenges: Map<string, { serverEphemeral: string; serverSession: string }> = new Map();

export class UserService {
  /**
   * Register a new user
   */
  async registerUser(userData: UserRegistrationData): Promise<{ userId: string }> {
    // Check if user already exists
    const existingUser = await UserModel.getByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user in database
    const userId = await UserModel.create(userData);

    return { userId };
  }

  /**
   * Get login challenge for a user
   */
  async getLoginChallenge(email: string): Promise<AuthChallenge> {
    // Find user
    const user = await UserModel.getByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate server ephemeral and session
    const serverEphemeral = randomBytes(32).toString('hex');
    const serverSession = randomBytes(32).toString('hex');

    // Store challenge
    challenges.set(email, { serverEphemeral, serverSession });

    // Return challenge
    return {
      serverEphemeral,
      salt: user.clientSalt,
    };
  }

  /**
   * Verify login and issue token
   */
  async verifyLogin(email: string, authResponse: AuthResponse): Promise<AuthResult> {
    // Find user
    const user = await UserModel.getByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Get challenge
    const challenge = challenges.get(email);
    if (!challenge) {
      throw new Error('No active challenge');
    }

    // For now, we'll implement a simple verification
    // In a production app, you would implement proper SRP verification here
    // This is a simplified version that checks if the client provided valid-looking data
    
    if (!authResponse.clientProof || !authResponse.clientEphemeral) {
      throw new Error('Invalid credentials');
    }

    // Basic validation - in real implementation, verify the SRP proof
    if (authResponse.clientProof.length < 32 || authResponse.clientEphemeral.length < 32) {
      throw new Error('Invalid credentials');
    }
    
    // Clear challenge
    challenges.delete(email);

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      userId: user.id,
      username: user.username,
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return UserModel.getById(id);
  }

  /**
   * Get user DTO by ID
   */
  async getUserDTOById(id: string): Promise<UserDTO | null> {
    return UserModel.getDTOById(id);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }
}
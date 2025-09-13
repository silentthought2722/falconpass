/**
 * WebAuthn service for two-factor authentication
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { WebAuthnCredentialDTO, AuthResult } from '../types';
import { UserModel, WebAuthnCredentialModel } from '../models';

// Store challenges in memory (in production, use Redis or another distributed cache)
const challengeStore: Map<string, string> = new Map();

export class WebAuthnService {
  /**
   * Generate registration options for WebAuthn
   */
  async generateRegistrationOptions(userId: string): Promise<any> {
    // Find user
    const user = await UserModel.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get existing credentials
    const existingCredentials = await WebAuthnCredentialModel.getByUserId(userId);
    const excludeCredentials = existingCredentials.map(cred => ({
      id: Buffer.from(cred.credentialId, 'base64url'),
      type: 'public-key' as const,
      transports: cred.transports ? cred.transports.split(',') : undefined,
    }));

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpID,
      userID: userId,
      userName: user.username,
      userDisplayName: user.username,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    // Store challenge
    challengeStore.set(userId, options.challenge);

    return options;
  }

  /**
   * Verify registration response for WebAuthn
   */
  async verifyRegistration(userId: string, credential: any): Promise<{ verified: boolean }> {
    // Find user
    const user = await UserModel.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get expected challenge
    const expectedChallenge = challengeStore.get(userId);
    if (!expectedChallenge) {
      throw new Error('Challenge not found');
    }

    try {
      // Verify registration response
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: config.origin,
        expectedRPID: config.rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        // Save credential
        await WebAuthnCredentialModel.create({
          userId,
          credentialId: credential.id,
          publicKey: verification.registrationInfo.credentialPublicKey.toString('base64url'),
          counter: verification.registrationInfo.counter,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          transports: credential.response.transports ? credential.response.transports.join(',') : '',
        });

        // Clear challenge
        challengeStore.delete(userId);

        return { verified: true };
      }

      return { verified: false };
    } catch (error) {
      console.error('WebAuthn registration verification error:', error);
      return { verified: false };
    }
  }

  /**
   * Generate authentication options for WebAuthn
   */
  async generateAuthenticationOptions(userId: string): Promise<any> {
    // Find user
    const user = await UserModel.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get existing credentials
    const existingCredentials = await WebAuthnCredentialModel.getByUserId(userId);
    if (existingCredentials.length === 0) {
      throw new Error('No WebAuthn credentials found for this user');
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: config.rpID,
      allowCredentials: existingCredentials.map(cred => ({
        id: Buffer.from(cred.credentialId, 'base64url'),
        type: 'public-key' as const,
        transports: cred.transports ? cred.transports.split(',') : undefined,
      })),
      userVerification: 'preferred',
    });

    // Store challenge
    challengeStore.set(userId, options.challenge);

    return options;
  }

  /**
   * Verify authentication response for WebAuthn
   */
  async verifyAuthentication(userId: string, credential: any): Promise<AuthResult> {
    // Find user
    const user = await UserModel.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get expected challenge
    const expectedChallenge = challengeStore.get(userId);
    if (!expectedChallenge) {
      throw new Error('Challenge not found');
    }

    // Find the credential
    const storedCredential = await WebAuthnCredentialModel.getByCredentialId(credential.id);
    if (!storedCredential) {
      throw new Error('Credential not found');
    }

    try {
      // Verify authentication response
      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: config.origin,
        expectedRPID: config.rpID,
        authenticator: {
          credentialID: Buffer.from(storedCredential.credentialId, 'base64url'),
          credentialPublicKey: Buffer.from(storedCredential.publicKey, 'base64url'),
          counter: storedCredential.counter,
        },
      });

      if (verification.verified) {
        // Update counter
        await WebAuthnCredentialModel.update(storedCredential.id, {
          counter: verification.authenticationInfo.newCounter,
        });

        // Clear challenge
        challengeStore.delete(userId);

        // Generate JWT token
        const token = this.generateToken(userId);

        return {
          userId: user.id,
          username: user.username,
          token,
        };
      }

      throw new Error('Authentication failed');
    } catch (error) {
      console.error('WebAuthn authentication verification error:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Get WebAuthn credentials for a user
   */
  async getCredentialsByUserId(userId: string): Promise<WebAuthnCredentialDTO[]> {
    return WebAuthnCredentialModel.getDTOsByUserId(userId);
  }

  /**
   * Delete a WebAuthn credential
   */
  async deleteCredential(credentialId: string, userId: string): Promise<boolean> {
    const credential = await WebAuthnCredentialModel.getByCredentialId(credentialId);
    
    if (!credential || credential.userId !== userId) {
      return false;
    }
    
    return WebAuthnCredentialModel.delete(credential.id);
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
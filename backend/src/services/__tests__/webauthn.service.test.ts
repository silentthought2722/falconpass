import { WebAuthnService } from '../webauthn.service';
import { UserModel } from '../../models/user.model';
import { WebAuthnCredentialModel } from '../../models/webauthn-credential.model';
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import config from '../../config';

// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('../../models/webauthn-credential.model');
jest.mock('@simplewebauthn/server');
jest.mock('jsonwebtoken');

describe('WebAuthnService', () => {
  let webAuthnService: WebAuthnService;
  const mockUserId = 'user-123';
  const mockUsername = 'testuser';
  const mockUser = {
    id: mockUserId,
    username: mockUsername,
    email: 'test@example.com',
  };
  const mockCredentialId = 'credential-123';
  const mockCredential = {
    id: mockCredentialId,
    userId: mockUserId,
    credentialId: 'base64-credential-id',
    publicKey: 'base64-public-key',
    counter: 0,
    transports: ['usb', 'nfc'],
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    webAuthnService = new WebAuthnService();

    // Mock config
    config.webauthn.rpName = 'FalconPass';
    config.webauthn.rpID = 'localhost';
    config.webauthn.origin = 'http://localhost:3000';

    // Mock JWT
    (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
  });

  describe('generateRegistrationOptions', () => {
    it('should generate registration options for a user', async () => {
      // Setup mocks
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (WebAuthnCredentialModel.findByUserId as jest.Mock).mockResolvedValue([]);
      (generateRegistrationOptions as jest.Mock).mockReturnValue({
        challenge: 'mock-challenge',
        rp: { name: 'FalconPass', id: 'localhost' },
        user: { id: mockUserId, name: mockUsername, displayName: mockUsername },
        pubKeyCredParams: [],
        timeout: 60000,
      });

      // Execute
      const result = await webAuthnService.generateRegistrationOptions(mockUserId);

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(WebAuthnCredentialModel.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(generateRegistrationOptions).toHaveBeenCalled();
      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('rp');
      expect(result).toHaveProperty('user');
    });

    it('should throw an error if user is not found', async () => {
      // Setup mock
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(webAuthnService.generateRegistrationOptions(mockUserId))
        .rejects.toThrow('User not found');
    });
  });

  describe('verifyRegistration', () => {
    const mockCredentialResponse = {
      id: 'credential-id',
      rawId: 'raw-id',
      response: {
        clientDataJSON: 'client-data',
        attestationObject: 'attestation-object',
      },
      type: 'public-key',
    };

    it('should verify registration and create credential', async () => {
      // Setup mocks
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (verifyRegistrationResponse as jest.Mock).mockResolvedValue({
        verified: true,
        registrationInfo: {
          credentialID: Buffer.from('credential-id'),
          credentialPublicKey: Buffer.from('public-key'),
          counter: 0,
        },
      });
      (WebAuthnCredentialModel.create as jest.Mock).mockResolvedValue(mockCredential);

      // Execute
      const result = await webAuthnService.verifyRegistration(
        mockUserId,
        'mock-challenge',
        mockCredentialResponse
      );

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(verifyRegistrationResponse).toHaveBeenCalled();
      expect(WebAuthnCredentialModel.create).toHaveBeenCalled();
      expect(result).toEqual({
        verified: true,
        credential: mockCredential,
      });
    });

    it('should return verified: false if verification fails', async () => {
      // Setup mocks
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (verifyRegistrationResponse as jest.Mock).mockResolvedValue({
        verified: false,
      });

      // Execute
      const result = await webAuthnService.verifyRegistration(
        mockUserId,
        'mock-challenge',
        mockCredentialResponse
      );

      // Assert
      expect(verifyRegistrationResponse).toHaveBeenCalled();
      expect(WebAuthnCredentialModel.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        verified: false,
      });
    });
  });

  describe('generateAuthenticationOptions', () => {
    it('should generate authentication options for a user', async () => {
      // Setup mocks
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (WebAuthnCredentialModel.findByUserId as jest.Mock).mockResolvedValue([mockCredential]);
      (generateAuthenticationOptions as jest.Mock).mockReturnValue({
        challenge: 'mock-challenge',
        timeout: 60000,
        rpId: 'localhost',
        allowCredentials: [{
          id: Buffer.from('base64-credential-id'),
          type: 'public-key',
          transports: ['usb', 'nfc'],
        }],
        userVerification: 'preferred',
      });

      // Execute
      const result = await webAuthnService.generateAuthenticationOptions(mockUserId);

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(WebAuthnCredentialModel.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(generateAuthenticationOptions).toHaveBeenCalled();
      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('allowCredentials');
    });

    it('should throw an error if user has no credentials', async () => {
      // Setup mocks
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (WebAuthnCredentialModel.findByUserId as jest.Mock).mockResolvedValue([]);

      // Execute & Assert
      await expect(webAuthnService.generateAuthenticationOptions(mockUserId))
        .rejects.toThrow('No credentials found for this user');
    });
  });

  describe('verifyAuthentication', () => {
    const mockAuthenticationResponse = {
      id: 'credential-id',
      rawId: 'raw-id',
      response: {
        clientDataJSON: 'client-data',
        authenticatorData: 'authenticator-data',
        signature: 'signature',
        userHandle: 'user-handle',
      },
      type: 'public-key',
    };

    it('should verify authentication and return token', async () => {
      // Setup mocks
      (WebAuthnCredentialModel.findByCredentialId as jest.Mock).mockResolvedValue(mockCredential);
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (verifyAuthenticationResponse as jest.Mock).mockResolvedValue({
        verified: true,
        authenticationInfo: {
          newCounter: 1,
        },
      });
      (WebAuthnCredentialModel.updateCounter as jest.Mock).mockResolvedValue({
        ...mockCredential,
        counter: 1,
      });

      // Execute
      const result = await webAuthnService.verifyAuthentication(
        'mock-challenge',
        mockAuthenticationResponse
      );

      // Assert
      expect(WebAuthnCredentialModel.findByCredentialId).toHaveBeenCalled();
      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(verifyAuthenticationResponse).toHaveBeenCalled();
      expect(WebAuthnCredentialModel.updateCounter).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        verified: true,
        token: 'mock-jwt-token',
        user: mockUser,
      });
    });

    it('should return verified: false if verification fails', async () => {
      // Setup mocks
      (WebAuthnCredentialModel.findByCredentialId as jest.Mock).mockResolvedValue(mockCredential);
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (verifyAuthenticationResponse as jest.Mock).mockResolvedValue({
        verified: false,
      });

      // Execute
      const result = await webAuthnService.verifyAuthentication(
        'mock-challenge',
        mockAuthenticationResponse
      );

      // Assert
      expect(verifyAuthenticationResponse).toHaveBeenCalled();
      expect(WebAuthnCredentialModel.updateCounter).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(result).toEqual({
        verified: false,
      });
    });
  });
});
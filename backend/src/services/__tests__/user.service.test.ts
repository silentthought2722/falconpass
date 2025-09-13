import { UserService } from '../user.service';
import { UserModel } from '../../models';

// Mock the models
jest.mock('../../models', () => ({
  UserModel: {
    getByEmail: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    getDTOById: jest.fn(),
  },
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        clientSalt: 'salt123',
        verifier: 'verifier123',
      };
      
      // Mock UserModel.getByEmail to return null (user doesn't exist)
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(null);
      
      // Mock UserModel.create to return a user ID
      (UserModel.create as jest.Mock).mockResolvedValue('user123');

      // Act
      const result = await userService.registerUser(userData);

      // Assert
      expect(UserModel.getByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserModel.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ userId: 'user123' });
    });

    it('should throw an error if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
        clientSalt: 'salt123',
        verifier: 'verifier123',
      };
      
      // Mock UserModel.getByEmail to return a user (user exists)
      (UserModel.getByEmail as jest.Mock).mockResolvedValue({
        id: 'existing123',
        email: userData.email,
      });

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow('User already exists');
      expect(UserModel.getByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getLoginChallenge', () => {
    it('should generate a login challenge for an existing user', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = {
        id: 'user123',
        email,
        clientSalt: 'salt123',
      };
      
      // Mock UserModel.getByEmail to return a user
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const challenge = await userService.getLoginChallenge(email);

      // Assert
      expect(UserModel.getByEmail).toHaveBeenCalledWith(email);
      expect(challenge).toHaveProperty('serverEphemeral');
      expect(challenge).toHaveProperty('salt', mockUser.clientSalt);
    });

    it('should throw an error if user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      
      // Mock UserModel.getByEmail to return null
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getLoginChallenge(email)).rejects.toThrow('User not found');
      expect(UserModel.getByEmail).toHaveBeenCalledWith(email);
    });
  });

  // Additional tests for verifyLogin, getUserById, and getUserDTOById would follow a similar pattern
});
import { VaultService } from '../vault.service';
import { VaultEntryModel } from '../../models/vault-entry.model';

// Mock the VaultEntryModel
jest.mock('../../models/vault-entry.model');

describe('VaultService', () => {
  let vaultService: VaultService;
  const mockUserId = 'user-123';
  const mockEntryId = 'entry-123';
  const mockEntry = {
    id: mockEntryId,
    userId: mockUserId,
    title: 'Test Entry',
    username: 'testuser',
    password: 'encrypted-password',
    url: 'https://example.com',
    notes: 'Test notes',
    category: 'Test Category',
    tags: ['test', 'example'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    vaultService = new VaultService();
  });

  describe('getEntriesByUserId', () => {
    it('should return entries for a user', async () => {
      // Setup mock
      (VaultEntryModel.findByUserId as jest.Mock).mockResolvedValue([mockEntry]);

      // Execute
      const result = await vaultService.getEntriesByUserId(mockUserId);

      // Assert
      expect(VaultEntryModel.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual([mockEntry]);
    });
  });

  describe('getEntryById', () => {
    it('should return an entry by ID', async () => {
      // Setup mock
      (VaultEntryModel.findById as jest.Mock).mockResolvedValue(mockEntry);

      // Execute
      const result = await vaultService.getEntryById(mockEntryId, mockUserId);

      // Assert
      expect(VaultEntryModel.findById).toHaveBeenCalledWith(mockEntryId);
      expect(result).toEqual(mockEntry);
    });

    it('should return null if entry does not belong to user', async () => {
      // Setup mock - entry exists but belongs to different user
      const differentUserEntry = { ...mockEntry, userId: 'different-user' };
      (VaultEntryModel.findById as jest.Mock).mockResolvedValue(differentUserEntry);

      // Execute
      const result = await vaultService.getEntryById(mockEntryId, mockUserId);

      // Assert
      expect(VaultEntryModel.findById).toHaveBeenCalledWith(mockEntryId);
      expect(result).toBeNull();
    });
  });

  describe('createEntry', () => {
    it('should create a new vault entry', async () => {
      // Setup mock
      (VaultEntryModel.create as jest.Mock).mockResolvedValue(mockEntry);

      // Execute
      const entryData = {
        title: mockEntry.title,
        username: mockEntry.username,
        password: mockEntry.password,
        url: mockEntry.url,
        notes: mockEntry.notes,
        category: mockEntry.category,
        tags: mockEntry.tags,
      };
      const result = await vaultService.createEntry(mockUserId, entryData);

      // Assert
      expect(VaultEntryModel.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...entryData,
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('updateEntry', () => {
    it('should update an existing entry if it belongs to the user', async () => {
      // Setup mocks
      (VaultEntryModel.findById as jest.Mock).mockResolvedValue(mockEntry);
      const updatedEntry = { ...mockEntry, title: 'Updated Title' };
      (VaultEntryModel.update as jest.Mock).mockResolvedValue(updatedEntry);

      // Execute
      const updateData = { title: 'Updated Title' };
      const result = await vaultService.updateEntry(mockEntryId, mockUserId, updateData);

      // Assert
      expect(VaultEntryModel.findById).toHaveBeenCalledWith(mockEntryId);
      expect(VaultEntryModel.update).toHaveBeenCalledWith(mockEntryId, updateData);
      expect(result).toEqual(updatedEntry);
    });

    it('should return null if entry does not belong to user', async () => {
      // Setup mock - entry exists but belongs to different user
      const differentUserEntry = { ...mockEntry, userId: 'different-user' };
      (VaultEntryModel.findById as jest.Mock).mockResolvedValue(differentUserEntry);

      // Execute
      const updateData = { title: 'Updated Title' };
      const result = await vaultService.updateEntry(mockEntryId, mockUserId, updateData);

      // Assert
      expect(VaultEntryModel.findById).toHaveBeenCalledWith(mockEntryId);
      expect(VaultEntryModel.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry if it belongs to the user', async () => {
      // Setup mocks
      (VaultEntryModel.findById as jest.Mock).mockResolvedValue(mockEntry);
      (VaultEntryModel.delete as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await vaultService.deleteEntry(mockEntryId, mockUserId);

      // Assert
      expect(VaultEntryModel.findById).toHaveBeenCalledWith(mockEntryId);
      expect(VaultEntryModel.delete).toHaveBeenCalledWith(mockEntryId);
      expect(result).toBe(true);
    });

    it('should return false if entry does not belong to user', async () => {
      // Setup mock - entry exists but belongs to different user
      const differentUserEntry = { ...mockEntry, userId: 'different-user' };
      (VaultEntryModel.findById as jest.Mock).mockResolvedValue(differentUserEntry);

      // Execute
      const result = await vaultService.deleteEntry(mockEntryId, mockUserId);

      // Assert
      expect(VaultEntryModel.findById).toHaveBeenCalledWith(mockEntryId);
      expect(VaultEntryModel.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
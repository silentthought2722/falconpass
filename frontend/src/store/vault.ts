/**
 * Vault Store
 * 
 * Manages vault entries state using Zustand
 */

import { create } from 'zustand';
import * as vaultService from '../services/vault';
import type { VaultEntry, VaultState } from '../types';

const initialState: VaultState = {
  entries: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedTags: [],
  selectedCategory: null,
  showFavoritesOnly: false,
};

export const useVaultStore = create<
  VaultState & {
    fetchEntries: (key: Uint8Array) => Promise<void>;
    getEntry: (id: string, key: Uint8Array) => Promise<VaultEntry | null>;
    createEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>, key: Uint8Array, salt: Uint8Array) => Promise<VaultEntry>;
    updateEntry: (id: string, entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>, key: Uint8Array, salt: Uint8Array) => Promise<VaultEntry>;
    deleteEntry: (id: string) => Promise<boolean>;
    setSearchTerm: (term: string) => void;
    setSelectedTags: (tags: string[]) => void;
    setSelectedCategory: (category: string | null) => void;
    setShowFavoritesOnly: (show: boolean) => void;
    clearFilters: () => void;
    exportVault: (key: Uint8Array, salt: Uint8Array) => string;
    importVault: (jsonData: string, key: Uint8Array, salt: Uint8Array) => Promise<VaultEntry[]>;
    clearError: () => void;
  }
>(set => ({
  ...initialState,

  fetchEntries: async (key) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await vaultService.getVaultEntries(key);
      set({ entries, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vault entries',
      });
    }
  },

  getEntry: async (id, key) => {
    try {
      return await vaultService.getVaultEntry(id, key);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : `Failed to get entry ${id}`,
      });
      return null;
    }
  },

  createEntry: async (entry, key, salt) => {
    set({ isLoading: true, error: null });
    try {
      const newEntry = await vaultService.createVaultEntry(entry, key, salt);
      set(state => ({
        entries: [...state.entries, newEntry],
        isLoading: false,
      }));
      return newEntry;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create entry',
      });
      throw error;
    }
  },

  updateEntry: async (id, entry, key, salt) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEntry = await vaultService.updateVaultEntry(id, entry, key, salt);
      set(state => ({
        entries: state.entries.map(e => (e.id === id ? updatedEntry : e)),
        isLoading: false,
      }));
      return updatedEntry;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to update entry ${id}`,
      });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await vaultService.deleteVaultEntry(id);
      if (success) {
        set(state => ({
          entries: state.entries.filter(e => e.id !== id),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return success;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to delete entry ${id}`,
      });
      return false;
    }
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

  clearFilters: () => set({
    searchTerm: '',
    selectedTags: [],
    selectedCategory: null,
    showFavoritesOnly: false,
  }),

  exportVault: (key, salt) => {
    const { entries } = useVaultStore.getState();
    return vaultService.exportVault(entries, key, salt);
  },

  importVault: async (jsonData, key, salt) => {
    set({ isLoading: true, error: null });
    try {
      // Parse and decrypt the imported entries
      const importedEntries = vaultService.importVault(jsonData, key);
      
      // Save to server
      const savedEntries = await vaultService.importVaultEntries(importedEntries, key, salt);
      
      // Update state
      set(state => ({
        entries: [...state.entries, ...savedEntries],
        isLoading: false,
      }));
      
      return savedEntries;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to import vault',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Selector for filtered entries
export const useFilteredEntries = () => {
  const { entries, searchTerm, selectedTags, selectedCategory, showFavoritesOnly } = useVaultStore();
  
  return entries.filter(entry => {
    // Filter by search term
    if (searchTerm && !entry.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !entry.username?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !entry.url?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by tags
    if (selectedTags.length > 0 && (!entry.tags || !selectedTags.every(tag => entry.tags?.includes(tag)))) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && entry.category !== selectedCategory) {
      return false;
    }
    
    // Filter by favorites
    if (showFavoritesOnly && !entry.favorite) {
      return false;
    }
    
    return true;
  });
};
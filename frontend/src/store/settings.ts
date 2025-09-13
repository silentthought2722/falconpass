/**
 * Settings Store
 * 
 * Manages application settings using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, SettingsState } from '../types';

const defaultSettings: Settings = {
  autoLockTimeout: 5, // 5 minutes
  clearClipboardAfter: 30, // 30 seconds
  theme: 'system',
  defaultPasswordLength: 16,
  defaultPasswordOptions: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
};

const initialState: SettingsState = {
  ...defaultSettings,
  isLoading: false,
  error: null,
};

export const useSettingsStore = create<
  SettingsState & {
    updateSettings: (settings: Partial<Settings>) => void;
    resetSettings: () => void;
  }
>(
  persist(
    (set) => ({
      ...initialState,

      updateSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }));
      },

      resetSettings: () => {
        set({
          ...defaultSettings,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'falcon-pass-settings',
    }
  )
);
import { setTranslationLocale, type Locale } from '@/i18n/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppearanceMode = 'light' | 'dark' | 'system';
export type NotificationKind = 'rent' | 'invoices' | 'contracts' | 'maintenance' | 'marketing';
export const notificationDefaults: Record<NotificationKind, boolean> = {
  rent: true,
  invoices: true,
  contracts: true,
  maintenance: true,
  marketing: false,
};
interface Preferences {
  language: Locale;
  setLanguage: (value: Locale) => void;
  appearance: AppearanceMode;
  notifications: Record<NotificationKind, boolean>;
  setAppearance: (value: AppearanceMode) => void;
  setNotification: (key: NotificationKind, value: boolean) => void;
  reset: () => void;
}
export const usePreferencesStore = create<Preferences>()(
  persist(
    (set) => ({
      appearance: 'light',
      language: 'vi',
      setLanguage: (language) => {
        setTranslationLocale(language);
        set({ language });
      },
      notifications: { ...notificationDefaults },
      setAppearance: (appearance) => set({ appearance }),
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      reset: () => {
        setTranslationLocale('vi');
        set({ language: 'vi', appearance: 'light', notifications: { ...notificationDefaults } });
      },
    }),
    {
      name: 'rentalos-preferences-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ appearance, notifications, language }) => ({
        appearance,
        notifications,
        language,
      }),
      onRehydrateStorage: () => (state) => {
        setTranslationLocale(state?.language ?? 'vi');
      },
    },
  ),
);

usePreferencesStore.subscribe((state) => setTranslationLocale(state.language));

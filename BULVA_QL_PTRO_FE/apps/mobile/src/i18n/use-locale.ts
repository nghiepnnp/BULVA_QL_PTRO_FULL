import { usePreferencesStore } from '@/features/settings/store/preferences.store';
/** Subscribe rendering to the selected language. Translation also works in non-React services. */
export function useLocale() {
  return usePreferencesStore((state) => state.language);
}

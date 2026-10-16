/**
 * RentalOS's one palette source is apps/mobile/design-tokens.json.
 * Tokens match the supplied HTML prototype (except danger red, needed for errors).
 * Tailwind and JavaScript-based styles read exactly the same values.
 */
import { useColorScheme } from 'react-native';
import { usePreferencesStore } from '@/features/settings/store/preferences.store';
import palette from '../../../design-tokens.json';
export const lightPalette = palette;
export const darkPalette: typeof palette = {
  ...palette,
  canvas: '#161D20',
  surface: '#222B2E',
  ink: '#EDF3F1',
  muted: '#A4B4B1',
  line: '#35423F',
  brand: '#79D3B1',
  'brand-soft': '#253F36',
  'unit-ink': '#B0C6DC',
  'unit-soft': '#293744',
  'resident-ink': '#BDC7F1',
  'resident-soft': '#30364F',
  'vacant-ink': '#E9BE7B',
  'vacant-soft': '#443827',
  warning: '#F0C178',
  'warning-soft': '#453925',
  danger: '#FF9199',
  'danger-soft': '#482D33',
  disabled: '#849690',
  'neutral-soft': '#303E3A',
  'neutral-ink': '#BDCEC7',
  'avatar-soft': '#294338',
  'avatar-ink': '#95DDC1',
  'metric-line': '#35423F',
};
export function useResolvedAppearance() {
  const preference = usePreferencesStore((s) => s.appearance);
  const system = useColorScheme();
  return preference === 'system' ? (system ?? 'light') : preference;
}

const mapColors = (palette: typeof lightPalette) => ({
  background: palette.canvas,
  surface: palette.surface,
  ink: palette.ink,
  muted: palette.muted,
  line: palette.line,
  primary: palette.brand,
  primaryTint: palette['brand-soft'],
  heroStart: palette['hero-start'],
  heroEnd: palette['hero-end'],
  heroProgress: palette['hero-progress'],
  thumbnail: palette['thumbnail-ink'],
  thumbnailStart: palette['thumbnail-start'],
  thumbnailEnd: palette['thumbnail-end'],
  unit: palette['unit-ink'],
  unitTint: palette['unit-soft'],
  resident: palette['resident-ink'],
  residentTint: palette['resident-soft'],
  vacant: palette['vacant-ink'],
  vacantTint: palette['vacant-soft'],
  progress: palette['hero-progress'],
  metricBorder: palette['metric-line'],
  green: palette.brand,
  greenTint: palette['brand-soft'],
  amber: palette.warning,
  amberTint: palette['warning-soft'],
  red: palette.danger,
  redTint: palette['danger-soft'],
  disabled: palette.disabled,
  neutralTint: palette['neutral-soft'],
  neutralInk: palette['neutral-ink'],
  avatarTint: palette['avatar-soft'],
  avatarInk: palette['avatar-ink'],
});
export const radius = { lg: 18, md: 15, sm: 10 };

export const colors = mapColors(lightPalette);
const nightColors = mapColors(darkPalette);
export function useThemeColors() {
  return useResolvedAppearance() === 'dark' ? nightColors : colors;
}

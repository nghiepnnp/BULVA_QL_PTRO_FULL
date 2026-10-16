import { type ReactNode } from 'react';
import { View } from 'react-native';
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { useThemeColors, useResolvedAppearance, lightPalette, darkPalette } from './theme';

function channels(hex: string) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(' ');
}
const variables = (palette: typeof lightPalette) =>
  vars(
    Object.fromEntries(
      Object.entries(palette).map(([key, value]) => [`--color-${key}`, channels(value)]),
    ),
  );
const lightVariables = variables(lightPalette);
const darkVariables = variables(darkPalette);
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const dark = useResolvedAppearance() === 'dark';
  const colors = useThemeColors();
  const base = dark ? DarkTheme : DefaultTheme;
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.background },
        dark ? darkVariables : lightVariables,
      ]}
    >
      <NavigationThemeProvider
        value={{
          ...base,
          colors: {
            ...base.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.ink,
            border: colors.line,
            notification: colors.red,
          },
        }}
      >
        <StatusBar style={dark ? 'light' : 'dark'} />
        {children}
      </NavigationThemeProvider>
    </View>
  );
}

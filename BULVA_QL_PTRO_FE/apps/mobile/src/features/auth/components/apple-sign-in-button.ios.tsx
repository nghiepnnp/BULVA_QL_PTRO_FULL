import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useResolvedAppearance } from '@/components/ui/theme';
import type { AppleButtonProps } from './apple-sign-in-button';
export default function AppleSignInButton({ disabled, onPress }: AppleButtonProps) {
  const [available, setAvailable] = useState(false);
  const appearance = useResolvedAppearance();
  useEffect(() => {
    let active = true;
    void AppleAuthentication.isAvailableAsync()
      .then((value) => {
        if (active) setAvailable(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  if (!available) return null;
  // Native Apple button supplies the system-localized title, official logo and accessibility.
  return (
    <View
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.55 : 1 }}
    >
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={
          appearance === 'dark'
            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={13}
        style={{ width: '100%', height: 52 }}
        onPress={() => {
          if (!disabled) onPress();
        }}
      />
    </View>
  );
}

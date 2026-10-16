import { Pressable, Text } from "react-native";
import { Icon } from "@/components/ui/components";
import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
export type AppleButtonProps = { disabled: boolean; onPress: () => void };
export default function AppleSignInButton({
  disabled,
  onPress,
}: AppleButtonProps) {
  useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("TIEP_TUC_VOI_APPLE")}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="h-[52px] rounded-[13px] bg-black flex-row items-center justify-center gap-3"
      style={{ opacity: disabled ? 0.55 : 1 }}
    >
      <Icon name="logo-apple" size={22} color="white" />
      <Text className="text-white font-semibold text-[15px]">
        {t("TIEP_TUC_VOI_APPLE")}
      </Text>
    </Pressable>
  );
}

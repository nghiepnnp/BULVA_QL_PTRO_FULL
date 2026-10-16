import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useThemeColors } from "@/components/ui/theme";
import AppleSignInButton from "./apple-sign-in-button";
import { socialConfig } from "../services/social-config";
import type { SocialProvider } from "../services/social-types";
export function SocialSignInButtons({
  disabled,
  pending,
  onPress,
}: {
  disabled: boolean;
  pending: SocialProvider | null;
  onPress: (provider: SocialProvider) => void;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <View className="mt-5">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="h-px flex-1 bg-line" />
        <Text className="text-xs text-muted">{t("HOAC_TIEP_TUC_VOI")}</Text>
        <View className="h-px flex-1 bg-line" />
      </View>
      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("TIEP_TUC_VOI_GOOGLE")}
          accessibilityState={{ disabled, busy: pending === "google" }}
          disabled={disabled}
          onPress={() => onPress("google")}
          className="h-[52px] rounded-[13px] border border-line bg-surface flex-row items-center justify-center gap-3"
          style={{ opacity: disabled ? 0.55 : 1 }}
        >
          <Image
            source={require("../../../assets/google-logo.png")}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
            accessible={false}
          />
          <Text className="text-ink text-[15px] font-semibold">
            {t("TIEP_TUC_VOI_GOOGLE")}
          </Text>
        </Pressable>
        {Platform.OS !== "android" && (
          <AppleSignInButton
            disabled={disabled}
            onPress={() => onPress("apple")}
          />
        )}
      </View>
      {pending && (
        <View
          accessibilityLiveRegion="polite"
          className="mt-3 flex-row items-center justify-center gap-2"
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="text-xs text-muted">{t("DANG_DANG_NHAP")}</Text>
        </View>
      )}
      {(!socialConfig.enabled || socialConfig.demo) && (
        <Text className="text-xs text-muted leading-5 mt-3 text-center">
          {t("GOOGLE_VA_APPLE_SE_KHA_DUNG_KHI_DICH_VU_DANG_NHAP_DUOC")}
        </Text>
      )}
    </View>
  );
}

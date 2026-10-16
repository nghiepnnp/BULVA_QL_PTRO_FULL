import { SocialSignInButtons } from "../components/social-sign-in-buttons";
import {
  signInWithProvider,
  socialErrorMessage,
} from "../services/social-session";
import type { SocialProvider } from "../services/social-types";
import { socialConfig } from "../services/social-config";
import { t, translateMessage } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginSchema, useSessionStore } from "@package/shared";
import { Icon } from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { signInAndStore } from "../services/session";

export default function LoginScreen() {
  useLocale();
  const colors = useThemeColors();
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [email, setEmail] = useState(
    socialConfig.demo ? "demo@example.com" : "",
  );
  const [password, setPassword] = useState(
    socialConfig.demo ? "Password123!" : "",
  );
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [provider, setProvider] = useState<SocialProvider | null>(null);

  async function socialLogin(next: SocialProvider) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setProvider(next);
    setError("");
    try {
      const user = await signInWithProvider(next);
      if (user) setUser(user);
    } catch (error) {
      setError(socialErrorMessage(error));
    } finally {
      inFlight.current = false;
      setBusy(false);
      setProvider(null);
    }
  }
  const [error, setError] = useState("");
  async function login() {
    if (inFlight.current) return;
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(
        t(
          parsed.error.issues[0]?.path[0] === "email"
            ? "DIA_CHI_EMAIL_CHUA_HOP_LE"
            : "MAT_KHAU_CAN_IT_NHAT_8_KY_TU",
        ),
      );
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const user = await signInAndStore(email.trim(), password);
      setUser(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("KHONG_THE_DANG_NHAP"));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-[26px] py-[36px]"
          keyboardShouldPersistTaps="handled"
        >
          <View className="h-[67px] w-[67px] rounded-[22px] bg-brand-action items-center justify-center mb-[32px]">
            <Icon name="home" size={35} color="white" />
          </View>
          <Text className="font-black text-[32px] tracking-[-1px] text-ink">
            {t("QUAN_LY_NHA_CHO_THUE")}
            {`\n`}
            {t("TRONG_TAM_TAY")}
          </Text>
          <Text className="text-muted mt-[13px] text-[14px] leading-[22px] mb-[32px]">
            {t("DANG_NHAP_RENTALOS_DE_QUAN_LY_BAT_DONG_SAN_PHONG_VA_NGUOI")}
          </Text>
          <Text className="font-extrabold text-[13px] text-ink mb-[8px]">
            {t("EMAIL")}
          </Text>
          <TextInput
            accessibilityLabel={t("EMAIL")}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            className={inputClassName}
            placeholder="email@example.com"
          />
          <Text className="font-extrabold text-[13px] text-ink mb-[8px] mt-[16px]">
            {t("MAT_KHAU")}
          </Text>
          <TextInput
            accessibilityLabel={t("MAT_KHAU")}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            className={inputClassName}
            placeholder="••••••••"
          />
          <Pressable
            disabled={busy}
            onPress={() => void login()}
            className="bg-brand-action rounded-[15px] min-h-[52px] items-center justify-center mt-[22px]"
          >
            {busy && !provider ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-[15px] font-extrabold">
                {t("DANG_NHAP")}
              </Text>
            )}
          </Pressable>
          <SocialSignInButtons
            disabled={busy}
            pending={provider}
            onPress={(next) => void socialLogin(next)}
          />
          {!!error && (
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              className="text-danger text-[12px] mt-3 leading-5"
            >
              {translateMessage(error)}
            </Text>
          )}
          <Pressable
            disabled={busy}
            onPress={() => router.push("/(auth)/register")}
            className="self-center p-[14px] mt-[8px]"
          >
            <Text className="font-bold text-brand">
              {t("CHUA_CO_TAI_KHOAN_DANG_KY")}
            </Text>
          </Pressable>
          {socialConfig.demo && (
            <View className="p-[14px] bg-brand-soft rounded-[13px] mt-[20px]">
              <Text className="text-brand font-extrabold text-[12px]">
                {t("CHE_DO_DEMO_KHONG_CAN_BACKEND")}
              </Text>
              <Text className="text-muted text-[12px] leading-[19px] mt-[6px]">
                demo@example.com / Password123!{`\n`}
                {t("TRONG_MOCK_MODE_EMAIL_VA_MAT_KHAU_HOP_LE_SE_DUOC_CHAP")}
              </Text>
            </View>
          )}
          <View className="mt-5 flex-row flex-wrap justify-center gap-4">
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: "/legal/[document]",
                  params: { document: "privacy" },
                })
              }
            >
              <Text className="text-xs text-brand">
                {t("CHINH_SACH_BAO_MAT")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: "/legal/[document]",
                  params: { document: "terms" },
                })
              }
            >
              <Text className="text-xs text-brand">
                {t("DIEU_KHOAN_SU_DUNG")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export const inputClassName =
  "h-[52px] rounded-[13px] border border-line bg-surface px-[14px] text-[15px] text-ink";

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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSessionStore } from "@package/shared";
import { Icon } from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { registerAndStore } from "../services/session";
import { inputClassName } from "./login-screen";
export default function RegisterScreen() {
  useLocale();
  const colors = useThemeColors();
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const user = await registerAndStore(name, email, password);
      setUser(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("KHONG_THE_DANG_KY"));
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
          contentContainerClassName="flex-grow justify-center px-[26px] py-[35px]"
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            disabled={busy}
            onPress={() => router.back()}
            className="mb-[22px]"
          >
            <Icon name="arrow-back" size={26} />
          </Pressable>
          <Text className="text-ink text-[30px] font-black">
            {socialConfig.demo ? t("TAO_TAI_KHOAN_DEMO") : t("TAO_TAI_KHOAN")}
          </Text>
          <Text className="text-[13px] text-muted mt-[10px] mb-[30px]">
            {socialConfig.demo
              ? t("TAO_HO_SO_CUC_BO_DE_THU_RENTALOS_CHUA_CO_DANG_KY")
              : t("TIEP_TUC_VOI_GOOGLE_HOAC_APPLE_DE_TAO_TAI_KHOAN_VA_DANG")}
          </Text>
          <Text className="mb-2 text-[13px] font-extrabold text-ink">
            {t("TEN_HIEN_THI")}
          </Text>
          <TextInput
            accessibilityLabel={t("TEN")}
            value={name}
            onChangeText={setName}
            className={inputClassName}
            placeholder={t("TEN_CUA_BAN")}
          />
          <Text className="mb-2 mt-[17px] text-[13px] font-extrabold text-ink">
            {t("EMAIL")}
          </Text>
          <TextInput
            accessibilityLabel={t("EMAIL")}
            value={email}
            onChangeText={setEmail}
            className={inputClassName}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@example.com"
          />
          <Text className="mb-2 mt-[17px] text-[13px] font-extrabold text-ink">
            {t("MAT_KHAU_IT_NHAT_8_KY_TU")}
          </Text>
          <TextInput
            accessibilityLabel={t("MAT_KHAU")}
            value={password}
            onChangeText={setPassword}
            className={inputClassName}
            secureTextEntry
            placeholder="••••••••"
          />
          <Pressable
            disabled={busy}
            onPress={() => void submit()}
            className="h-[52px] mt-[25px] rounded-[14px] bg-brand-action items-center justify-center"
          >
            {busy && !provider ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-extrabold text-[15px]">
                {t("TAO_TAI_KHOAN")}
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

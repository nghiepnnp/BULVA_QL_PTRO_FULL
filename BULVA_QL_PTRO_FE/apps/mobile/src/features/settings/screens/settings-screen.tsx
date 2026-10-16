import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@package/shared";
import { Icon, Page, PageHeader } from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { showAlert } from "@/components/ui/feedback";
import { signOutAndClear } from "@/features/auth/services/session";
import { SettingsGroup, SettingsRow } from "../components/settings-ui";
import { settingsConfig, isDemo } from "../services/settings-config";
import { usePreferencesStore } from "../store/preferences.store";

export default function SettingsScreen() {
  useLocale();
  const router = useRouter();
  const colors = useThemeColors();
  const user = useSessionStore((s) => s.user);
  const client = useQueryClient();
  const language = usePreferencesStore((s) => s.language);
  const appearance = usePreferencesStore((s) => s.appearance);
  const [busy, setBusy] = useState(false);
  const open = (section: string) =>
    router.push({
      pathname: "/(app)/preferences/[section]",
      params: { section },
    });
  const legal = (document: string) =>
    router.push({ pathname: "/legal/[document]", params: { document } });
  async function logout() {
    setBusy(true);
    try {
      await signOutAndClear();
      client.clear();
      useSessionStore.getState().clear();
    } catch (error) {
      showAlert(
        t("CHUA_THE_DANG_XUAT"),
        error instanceof Error ? error.message : t("VUI_LONG_THU_LAI"),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <PageHeader
        title={t("CAI_DAT")}
        eyebrow={t("TAI_KHOAN_UNG_DUNG")}
        right={
          <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-brand-soft">
            <Icon name="settings-outline" color={colors.primary} />
          </View>
        }
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("TAI_KHOAN_CUA_TOI")}
        onPress={() => open("account")}
        className="mb-7 flex-row items-center gap-[13px] rounded-[20px] border border-line bg-surface p-[18px] active:opacity-70"
      >
        <View className="h-[49px] w-[49px] items-center justify-center rounded-full bg-brand-soft">
          <Icon name="person-outline" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-ink">
            {user?.name || t("TAI_KHOAN_CUA_TOI")}
          </Text>
          <Text className="mt-1 text-xs text-muted" numberOfLines={1}>
            {user?.email}
          </Text>
          <Text className="mt-[7px] text-[11px] font-semibold text-brand">
            {t("QUAN_LY_TAI_KHOAN")}
          </Text>
        </View>
        <Icon name="chevron-forward" size={17} color={colors.disabled} />
      </Pressable>
      <SettingsGroup title={t("TUY_CHON_UNG_DUNG")}>
        <SettingsRow
          icon="notifications-outline"
          title={t("THONG_BAO")}
          subtitle={t("TIEN_PHONG_HOA_DON_HOP_DONG")}
          onPress={() => open("notifications")}
        />
        <SettingsRow
          icon="color-palette-outline"
          title={t("GIAO_DIEN")}
          value={
            { light: t("SANG"), dark: t("TOI"), system: t("HE_THONG") }[
              appearance
            ]
          }
          onPress={() => open("appearance")}
        />
        <SettingsRow
          icon="language-outline"
          title={t("NGON_NGU_TIEN_TE")}
          value={language === "vi" ? t("TIENG_VIET") : t("TIENG_ANH")}
          last
          onPress={() => open("language")}
        />
      </SettingsGroup>
      <SettingsGroup title={t("QUYEN_RIENG_TU_BAO_MAT")}>
        <SettingsRow
          icon="lock-closed-outline"
          title={t("DOI_MAT_KHAU")}
          onPress={() => open("password")}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          title={t("QUAN_LY_QUYEN_RIENG_TU")}
          onPress={() => open("privacy")}
        />
        <SettingsRow
          icon="document-lock-outline"
          title={t("CHINH_SACH_BAO_MAT")}
          onPress={() => legal("privacy")}
        />
        <SettingsRow
          icon="trash-outline"
          title={t("XOA_TAI_KHOAN")}
          danger
          last
          onPress={() => open("delete-account")}
        />
      </SettingsGroup>
      <SettingsGroup title={t("HO_TRO_PHAP_LY")}>
        <SettingsRow
          icon="diamond-outline"
          title={t("GOI_DICH_VU")}
          value={isDemo ? t("DEMO") : undefined}
          onPress={() => open("subscription")}
        />
        <SettingsRow
          icon="headset-outline"
          title={t("LIEN_HE_HO_TRO")}
          onPress={() => open("support")}
        />
        <SettingsRow
          icon="document-text-outline"
          title={t("DIEU_KHOAN_SU_DUNG")}
          onPress={() => legal("terms")}
        />
        <SettingsRow
          icon="information-circle-outline"
          title={t("GIOI_THIEU_UNG_DUNG")}
          last
          onPress={() => open("about")}
        />
      </SettingsGroup>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("DANG_XUAT")}
        disabled={busy}
        onPress={() =>
          showAlert(
            t("DANG_XUAT_CAU_HOI"),
            t("DU_LIEU_TREN_THIET_BI_VAN_DUOC_GIU_LAI"),
            [
              { text: t("O_LAI"), style: "cancel" },
              {
                text: t("DANG_XUAT"),
                onPress: () => {
                  void logout();
                },
              },
            ],
          )
        }
        className="min-h-[50px] flex-row items-center justify-center gap-2 rounded-[14px] border border-line bg-surface active:opacity-70"
      >
        <Icon name="log-out-outline" size={18} color={colors.red} />
        <Text className="text-sm font-semibold text-danger">
          {busy ? t("DANG_DANG_XUAT") : t("DANG_XUAT")}
        </Text>
      </Pressable>
      <Text className="mt-5 text-center text-[11px] text-muted">
        RentalOS Owner · {settingsConfig.version}
        {settingsConfig.build ? ` (${settingsConfig.build})` : ""}
      </Text>
      {isDemo && (
        <Text className="mt-1 text-center text-[10px] text-disabled">
          {t("BAN_TRAI_NGHIEM_DU_LIEU_TREN_THIET_BI")}
        </Text>
      )}
    </Page>
  );
}

import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@package/shared";
import {
  ActionButton,
  ChoiceField,
  DetailRow,
  Icon,
  Page,
  PageHeader,
  Panel,
  TextField,
} from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { showAlert } from "@/components/ui/feedback";
import { useRentalStore } from "@/features/rentals/store/rental.store";
import {
  Notice,
  Paragraph,
  PreferenceToggle,
  SettingsRow,
} from "../components/settings-ui";
import {
  usePreferencesStore,
  type AppearanceMode,
  type NotificationKind,
} from "../store/preferences.store";
import {
  deleteLocalAccount,
  updateLocalProfile,
} from "../services/account-service";
import {
  isDemo,
  openDeviceSettings,
  openExternal,
  settingsConfig,
} from "../services/settings-config";

function failure(error: unknown) {
  showAlert(
    t("CHUA_THE_HOAN_TAT"),
    error instanceof Error ? error.message : t("VUI_LONG_THU_LAI"),
  );
}
function run(action: () => Promise<void>) {
  void action().catch(failure);
}
export default function PreferencesScreen() {
  useLocale();
  const titles: Record<string, string> = {
    account: t("TAI_KHOAN_CUA_TOI"),
    notifications: t("THONG_BAO"),
    appearance: t("GIAO_DIEN"),
    language: t("NGON_NGU_TIEN_TE"),
    password: t("DOI_MAT_KHAU"),
    privacy: t("QUYEN_RIENG_TU"),
    "delete-account": t("XOA_TAI_KHOAN"),
    subscription: t("GOI_DICH_VU"),
    support: t("LIEN_HE_HO_TRO"),
    about: t("GIOI_THIEU_UNG_DUNG"),
  };
  const { section } = useLocalSearchParams<{ section: string }>();
  const router = useRouter();
  const screens: Record<string, React.ReactNode> = {
    account: <Account />,
    notifications: <Notifications />,
    appearance: <Appearance />,
    language: <Language />,
    password: <Password />,
    privacy: <Privacy />,
    "delete-account": <DeleteAccount />,
    subscription: <Subscription />,
    support: <Support />,
    about: <About />,
  };
  return (
    <Page>
      <PageHeader
        title={titles[section] ?? t("CAI_DAT")}
        eyebrow={t("CAI_DAT_TIEU_DE")}
        back
        onBack={() =>
          router.canGoBack()
            ? router.back()
            : router.replace("/(app)/(tabs)/settings")
        }
      />
      {screens[section] ?? (
        <Notice>{t("MUC_CAI_DAT_NAY_KHONG_TON_TAI")}</Notice>
      )}
    </Page>
  );
}
function Account() {
  useLocale();
  const user = useSessionStore((s) => s.user);
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function save() {
    if (!user || busy) return;
    setBusy(true);
    try {
      const updated = await updateLocalProfile(user, name);
      useSessionStore.getState().setUser(updated);
      showAlert(
        t("DA_LUU"),
        t("TEN_HIEN_THI_CUA_BAN_DA_DUOC_CAP_NHAT_TREN_THIET_BI"),
      );
    } catch (error) {
      failure(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Panel className="mb-5">
        <TextField
          label={t("TEN_HIEN_THI")}
          value={name}
          onChangeText={setName}
          required
        />
        <DetailRow label={t("EMAIL_DANG_NHAP")} value={user?.email ?? "—"} />
      </Panel>
      <Notice>
        {isDemo
          ? t("DAY_LA_HO_SO_DEMO_TREN_THIET_BI_EMAIL_DUNG_DE_NHAN")
          : t("VIEC_CAP_NHAT_TAI_KHOAN_SE_KHA_DUNG_KHI_DICH_VU_TAI")}
      </Notice>
      <ActionButton
        title={t("LUU_THAY_DOI")}
        onPress={() => {
          void save();
        }}
        loading={busy}
        disabled={!isDemo || name.trim() === user?.name}
      />
      <View className="mt-6">
        <SettingsRow
          icon="trash-outline"
          title={t("XOA_TAI_KHOAN")}
          danger
          last
          onPress={() =>
            router.push({
              pathname: "/(app)/preferences/[section]",
              params: { section: "delete-account" },
            })
          }
        />
      </View>
    </>
  );
}

function Notifications() {
  useLocale();
  const notificationRows: {
    key: NotificationKind;
    title: string;
    detail: string;
  }[] = [
    {
      key: "rent",
      title: t("TIEN_PHONG_DEN_HAN"),
      detail: t("NHAC_LICH_THANH_TOAN_TIEN_THUE"),
    },
    {
      key: "invoices",
      title: t("HOA_DON_MOI"),
      detail: t("HOA_DON_DIEN_NUOC_VA_CAC_KHOAN_DICH_VU"),
    },
    {
      key: "contracts",
      title: t("HOP_DONG"),
      detail: t("LICH_BAT_DAU_GIA_HAN_VA_KET_THUC_HOP_DONG"),
    },
    {
      key: "maintenance",
      title: t("BAO_TRI"),
      detail: t("YEU_CAU_SUA_CHUA_VA_TIEN_DO_XU_LY"),
    },
    {
      key: "marketing",
      title: t("TIN_TUC_UU_DAI"),
      detail: t("TUY_CHON_CO_THE_TAT_BAT_KY_LUC_NAO"),
    },
  ];
  const notifications = usePreferencesStore((s) => s.notifications);
  const setNotification = usePreferencesStore((s) => s.setNotification);
  return (
    <>
      <Notice>
        {t("TUY_CHON_DUOC_LUU_TREN_THIET_BI_PHIEN_BAN_HIEN_TAI_CHUA")}
      </Notice>
      <Panel>
        {notificationRows.map((row) => (
          <PreferenceToggle
            key={row.key}
            title={row.title}
            detail={row.detail}
            value={notifications[row.key]}
            onChange={(value) => setNotification(row.key, value)}
          />
        ))}
      </Panel>
      <View className="mt-5">
        <ActionButton
          title={
            Platform.OS === "web"
              ? t("HUONG_DAN_QUYEN_TRINH_DUYET")
              : t("MO_CAI_DAT_THIET_BI")
          }
          icon="open-outline"
          variant="outline"
          onPress={() => run(openDeviceSettings)}
        />
      </View>
    </>
  );
}
function Appearance() {
  useLocale();
  const appearance = usePreferencesStore((s) => s.appearance);
  const setAppearance = usePreferencesStore((s) => s.setAppearance);
  const colors = useThemeColors();
  const options: {
    value: AppearanceMode;
    label: string;
    icon: "sunny-outline" | "moon-outline" | "phone-portrait-outline";
    detail: string;
  }[] = [
    {
      value: "light",
      label: t("SANG"),
      icon: "sunny-outline",
      detail: t("NEN_SANG_SAC_XANH_RENTALOS"),
    },
    {
      value: "dark",
      label: t("TOI"),
      icon: "moon-outline",
      detail: t("DIU_MAT_TRONG_ANH_SANG_YEU"),
    },
    {
      value: "system",
      label: t("THEO_HE_THONG"),
      icon: "phone-portrait-outline",
      detail: t("TU_DOI_THEO_GIAO_DIEN_THIET_BI"),
    },
  ];
  return (
    <>
      <Text className="mb-5 text-[13px] leading-5 text-muted">
        {t("CHON_GIAO_DIEN_PHU_HOP_VOI_BAN_THAY_DOI_AP_DUNG_NGAY")}
      </Text>
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{ checked: appearance === option.value }}
          aria-checked={appearance === option.value}
          accessibilityLabel={option.label}
          onPress={() => setAppearance(option.value)}
          className={`mb-3 flex-row items-center gap-4 rounded-[18px] border p-5 ${appearance === option.value ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
        >
          <Icon
            name={option.icon}
            size={25}
            color={appearance === option.value ? colors.primary : colors.muted}
          />
          <View className="flex-1">
            <Text className="text-sm font-bold text-ink">{option.label}</Text>
            <Text className="mt-1 text-xs text-muted">{option.detail}</Text>
          </View>
          {appearance === option.value && (
            <Icon name="checkmark-circle" color={colors.primary} />
          )}
        </Pressable>
      ))}
      <Panel className="mt-4">
        <Text className="mb-2 text-[10px] font-bold tracking-[1.5px] text-muted">
          {t("XEM_TRUOC")}
        </Text>
        <Text className="text-[20px] font-extrabold text-ink">
          {t("KHONG_GIAN_CUA_BAN")}
        </Text>
        <Text className="mb-4 mt-2 text-xs text-muted">
          {t("MOT_BANG_MAU_NHAT_QUAN_O_MOI_MAN_HINH")}
        </Text>
        <View className="h-2 rounded-full bg-brand-soft">
          <View className="h-full w-2/3 rounded-full bg-brand-action" />
        </View>
      </Panel>
    </>
  );
}
function Language() {
  useLocale();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const currency = useRentalStore((s) => s.defaultCurrency);
  const setCurrency = useRentalStore((s) => s.setDefaultCurrency);
  return (
    <>
      <Panel className="mb-5">
        <ChoiceField
          label={t("NGON_NGU_UNG_DUNG")}
          value={language}
          options={[
            { value: "vi", label: t("TIENG_VIET") },
            { value: "en", label: t("TIENG_ANH_ENGLISH") },
          ]}
          onChange={setLanguage}
        />
        <Text className="text-xs leading-5 text-muted">
          {t("THAY_DOI_AP_DUNG_NGAY_VA_DUOC_LUU_TREN_THIET_BI")}
        </Text>
      </Panel>
      <Panel>
        <ChoiceField
          label={t("TIEN_TE_MAC_DINH")}
          value={currency}
          options={["VND", "USD", "SGD", "GBP", "AUD"].map((value) => ({
            value,
            label: value,
          }))}
          onChange={setCurrency}
        />
        <Text className="text-xs leading-5 text-muted">
          {t("AP_DUNG_CHO_BAT_DONG_SAN_TAO_MOI_KHONG_QUY_DOI_GIA")}
        </Text>
      </Panel>
    </>
  );
}
function Password() {
  useLocale();
  return (
    <>
      <Notice>
        {isDemo
          ? t("BAN_DANG_DUNG_TAI_KHOAN_DEMO_MAT_KHAU_NHAP_O_MAN_HINH")
          : t("DICH_VU_DOI_MAT_KHAU_CHUA_DUOC_KET_NOI_TRONG_PHIEN_BAN")}
      </Notice>
      <Paragraph title={t("MAT_KHAU_TAI_KHOAN")}>
        {t("CHUC_NANG_DOI_MAT_KHAU_SE_DUOC_MO_KHI_TAI_KHOAN_CO")}
      </Paragraph>
      <ActionButton
        title={t("DOI_MAT_KHAU")}
        icon="lock-closed-outline"
        disabled
        onPress={() => {}}
      />
    </>
  );
}
function Privacy() {
  useLocale();
  const router = useRouter();
  const marketing = usePreferencesStore((s) => s.notifications.marketing);
  const setNotification = usePreferencesStore((s) => s.setNotification);
  return (
    <>
      <Panel className="mb-5">
        <Paragraph title={t("DU_LIEU_BAN_QUAN_LY")}>
          {t("HO_SO_TAI_KHOAN_BAT_DONG_SAN_PHONG_NGUOI_THUE_VA_LICH")}
        </Paragraph>
        <Paragraph title={t("PHAN_TICH_QUANG_CAO")}>
          {t("PHIEN_BAN_HIEN_TAI_KHONG_TICH_HOP_CONG_CU_PHAN_TICH_HANH")}
        </Paragraph>
        <PreferenceToggle
          title={t("NHAN_TIN_TUC_UU_DAI")}
          detail={t("DONG_Y_TUY_CHON_CO_THE_THU_HOI_NGAY_TAI_DAY_HIEN")}
          value={marketing}
          onChange={(value) => setNotification("marketing", value)}
        />
      </Panel>
      <Paragraph title={t("QUYEN_TRUY_CAP_THIET_BI")}>
        {t("CAMERA_ANH_VA_VI_TRI_CHUA_DUOC_SU_DUNG_O_PHIEN_BAN")}
      </Paragraph>
      <ActionButton
        title={
          Platform.OS === "web"
            ? t("XEM_HUONG_DAN_QUYEN_TRINH_DUYET")
            : t("MO_CAI_DAT_THIET_BI")
        }
        variant="outline"
        icon="open-outline"
        onPress={() => run(openDeviceSettings)}
      />
      <View className="mt-5">
        <SettingsRow
          icon="document-lock-outline"
          title={t("DOC_CHINH_SACH_BAO_MAT")}
          onPress={() =>
            router.push({
              pathname: "/legal/[document]",
              params: { document: "privacy" },
            })
          }
        />
        <SettingsRow
          icon="trash-outline"
          title={t("XOA_TAI_KHOAN_VA_DU_LIEU")}
          danger
          last
          onPress={() =>
            router.push({
              pathname: "/(app)/preferences/[section]",
              params: { section: "delete-account" },
            })
          }
        />
      </View>
    </>
  );
}
function DeleteAccount() {
  useLocale();
  const user = useSessionStore((s) => s.user);
  const client = useQueryClient();
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const colors = useThemeColors();
  const allowed =
    isDemo &&
    !!user &&
    email.trim().toLowerCase() === user.email.trim().toLowerCase() &&
    confirmed;
  async function remove() {
    if (!allowed || !user || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await deleteLocalAccount(user, email);
      client.clear();
      useSessionStore.getState().clear();
      showAlert(
        t("DA_XOA_DU_LIEU_DEMO"),
        t("HO_SO_PHIEN_DANG_NHAP_VA_DU_LIEU_QUAN_LY_TREN_THIET"),
      );
    } catch (error) {
      failure(error);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <View className="mb-5 h-[56px] w-[56px] items-center justify-center rounded-[18px] bg-danger-soft">
        <Icon name="trash-outline" color={colors.red} size={27} />
      </View>
      <Text className="mb-3 text-[23px] font-bold text-ink">
        {review ? t("XAC_NHAN_LAN_CUOI") : t("TRUOC_KHI_BAN_ROI_DI")}
      </Text>
      <Notice danger>
        {t("THAO_TAC_NAY_KHONG_THE_HOAN_TAC_DAY_LA_XOA_DU_LIEU")}
      </Notice>
      <Panel className="mb-5">
        <Paragraph title={t("DU_LIEU_SE_BI_XOA")}>
          {t("HO_SO_DEMO_PHIEN_DANG_NHAP_BAT_DONG_SAN_PHONG_NGUOI_THUE")}
        </Paragraph>
        <Paragraph title={t("DU_LIEU_DUOC_GIU_LAI")}>
          {t("BAN_DEMO_KHONG_GIU_LAI_HO_SO_CA_NHAN_HOAC_GIAO_DICH")}
        </Paragraph>
        <Text className="text-xs leading-5 text-muted">
          {t("THOI_GIAN_XU_LY_NGAY_TREN_THIET_BI_NEU_CHUA_HOAN_TAT")}
        </Text>
      </Panel>
      {!isDemo && (
        <Notice>
          {t("DICH_VU_XOA_TAI_KHOAN_MAY_CHU_CHUA_SAN_SANG_KHONG_CO")}
        </Notice>
      )}
      {!review ? (
        <>
          <TextField
            label={t("NHAP_EMAIL_DE_XAC_NHAN")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={user?.email}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            aria-checked={confirmed}
            accessibilityLabel={t("TOI_HIEU_DU_LIEU_SE_BI_XOA_VINH_VIEN")}
            onPress={() => setConfirmed(!confirmed)}
            className="mb-6 flex-row items-center gap-3 py-2"
          >
            <Icon
              name={confirmed ? "checkbox" : "square-outline"}
              color={confirmed ? colors.red : colors.muted}
            />
            <Text className="flex-1 text-[13px] leading-5 text-ink">
              {t("TOI_HIEU_DU_LIEU_SE_BI_XOA_VINH_VIEN_XAC_NHAN")}
            </Text>
          </Pressable>
          <ActionButton
            title={t("TIEP_TUC_XOA_TAI_KHOAN")}
            variant="danger"
            disabled={!allowed}
            onPress={() => setReview(true)}
          />
        </>
      ) : (
        <>
          <Text className="mb-5 text-sm leading-6 text-ink">
            {t("XOA_HO_SO") + " "}
            {user?.email}
            {" " + t("VA_TOAN_BO_DU_LIEU_DEMO_TREN_THIET_BI_NAY")}
          </Text>
          <ActionButton
            title={busy ? t("DANG_XOA") : t("XOA_VINH_VIEN_DU_LIEU_DEMO")}
            variant="danger"
            loading={busy}
            disabled={!allowed}
            onPress={() => {
              void remove();
            }}
          />
          <View className="mt-3">
            <ActionButton
              title={t("GIU_LAI_TAI_KHOAN")}
              variant="outline"
              disabled={busy}
              onPress={() => setReview(false)}
            />
          </View>
        </>
      )}
    </>
  );
}
function Subscription() {
  useLocale();
  const colors = useThemeColors();
  return (
    <>
      <Panel className="mb-5">
        <Icon name="diamond-outline" color={colors.primary} size={30} />
        <Text className="mb-2 mt-4 text-xl font-bold text-ink">
          {isDemo ? "RentalOS Demo" : "RentalOS Owner"}
        </Text>
        <Text className="text-[13px] leading-5 text-muted">
          {t("PHIEN_BAN_NAY_CHUA_BAN_GOI_PREMIUM_HOAC_DANG_KY_TU_DONG")}
        </Text>
      </Panel>
      <Paragraph title={t("MUA_HANG_KHOI_PHUC")}>
        {t("KHOI_PHUC_GIAO_DICH_SE_KHA_DUNG_KHI_UNG_DUNG_HO_TRO")}
      </Paragraph>
      <ActionButton
        title={t("KHOI_PHUC_MUA_HANG")}
        icon="refresh-outline"
        variant="outline"
        disabled
        onPress={() => {}}
      />
      {Platform.OS === "ios" && (
        <View className="mt-3">
          <ActionButton
            title={t("QUAN_LY_DANG_KY_APPLE")}
            icon="open-outline"
            variant="outline"
            onPress={() =>
              run(() =>
                openExternal("https://apps.apple.com/account/subscriptions"),
              )
            }
          />
        </View>
      )}
      <View className="mt-6">
        <Paragraph title={t("TIEN_THUE_DICH_VU_PHONG")}>
          {t("TIEN_PHONG_DIEN_NUOC_LA_CAC_KHOAN_THU_CUA_BAT_DONG_SAN")}
        </Paragraph>
      </View>
    </>
  );
}
function Support() {
  useLocale();
  const available = settingsConfig.supportEmail || settingsConfig.supportUrl;
  return (
    <>
      <Paragraph title={t("CHUNG_TOI_CO_THE_GIUP_GI")}>
        {t("KHI_LIEN_HE_HAY_MO_TA_BUOC_XAY_RA_LOI_VA_PHIEN")}
      </Paragraph>
      <Panel className="mb-5">
        <DetailRow label={t("UNG_DUNG")} value="RentalOS Owner" />
        <DetailRow label={t("PHIEN_BAN")} value={settingsConfig.version} />
        {settingsConfig.supportEmail && (
          <DetailRow
            label={t("EMAIL_HO_TRO")}
            value={settingsConfig.supportEmail}
          />
        )}
      </Panel>
      {settingsConfig.supportEmail && (
        <ActionButton
          title={t("SOAN_EMAIL_HO_TRO")}
          disabled={settingsConfig.placeholderLinks}
          icon="mail-outline"
          onPress={() =>
            run(() =>
              openExternal(
                `mailto:${settingsConfig.supportEmail}?subject=${encodeURIComponent(t("HO_TRO_RENTALOS_P0", { p0: settingsConfig.version }))}`,
              ),
            )
          }
        />
      )}
      {settingsConfig.supportUrl && (
        <View className="mt-3">
          <ActionButton
            title={
              settingsConfig.placeholderLinks
                ? t("MO_TRANG_HO_TRO_MAU")
                : t("MO_TRUNG_TAM_HO_TRO")
            }
            icon="open-outline"
            variant="outline"
            onPress={() => run(() => openExternal(settingsConfig.supportUrl!))}
          />
        </View>
      )}
      {settingsConfig.placeholderLinks && (
        <Notice>
          {t("DIA_CHI_WEBSITE_VA_EMAIL_HIEN_LA_VI_DU_MINH_HOA_CHUA")}
        </Notice>
      )}
      {!available && (
        <Notice>
          {t("KENH_HO_TRO_CHINH_THUC_CHUA_DUOC_CONG_BO_TRONG_BAN_TRAI")}
        </Notice>
      )}
    </>
  );
}
function About() {
  useLocale();
  const colors = useThemeColors();
  const resetDemo = useRentalStore((s) => s.resetDemo);
  return (
    <>
      <View className="mb-7 items-center">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-[25px] bg-brand-soft">
          <Icon name="home-outline" size={40} color={colors.primary} />
        </View>
        <Text className="text-[23px] font-extrabold text-ink">
          RentalOS Owner
        </Text>
        <Text className="mt-2 text-sm text-muted">
          {t("QUAN_LY_NHA_CHO_THUE_TRONG_TAM_TAY")}
        </Text>
      </View>
      <Panel className="mb-5">
        <DetailRow label={t("PHIEN_BAN")} value={settingsConfig.version} />
        <DetailRow
          label={t("BAN_DUNG")}
          value={String(settingsConfig.build ?? t("PHAT_TRIEN"))}
        />
        <DetailRow
          label={t("CHE_DO")}
          value={isDemo ? t("TRAI_NGHIEM_DEMO") : t("KET_NOI_DICH_VU")}
        />
      </Panel>
      <Paragraph title={t("DANH_CHO_CHU_NHA")}>
        {t("QUAN_LY_BAT_DONG_SAN_PHONG_NGUOI_THUE_LICH_SU_LUU_TRU")}
      </Paragraph>
      {isDemo && (
        <>
          <Notice>
            {t("DU_LIEU_DEMO_DUOC_LUU_TREN_THIET_BI_GO_UNG_DUNG_HOAC")}
          </Notice>
          <ActionButton
            title={t("KHOI_PHUC_DU_LIEU_MAU")}
            variant="outline"
            icon="refresh-outline"
            onPress={() =>
              showAlert(
                t("KHOI_PHUC_DU_LIEU_MAU_CAU_HOI"),
                t("TOAN_BO_THAY_DOI_QUAN_LY_PHONG_VA_NGUOI_THUE_TREN_THIET"),
                [
                  { text: t("HUY"), style: "cancel" },
                  {
                    text: t("KHOI_PHUC"),
                    style: "destructive",
                    onPress: resetDemo,
                  },
                ],
              )
            }
          />
        </>
      )}
    </>
  );
}

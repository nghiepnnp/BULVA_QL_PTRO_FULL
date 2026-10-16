import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { showAlert } from "@/components/ui/feedback";
import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { PropertyDraft, PropertyType } from "@package/shared";
import {
  ActionButton,
  ChoiceField,
  Page,
  PageHeader,
  TextField,
} from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { useRentalStore } from "@/features/rentals/store/rental.store";
export default function PropertyFormScreen() {
  useLocale();
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useRentalStore((s) => s.properties.find((p) => p.id === id));
  const add = useRentalStore((s) => s.addProperty);
  const update = useRentalStore((s) => s.updateProperty);
  const defaultCurrency = useRentalStore((s) => s.defaultCurrency);
  const [draft, setDraft] = useState<PropertyDraft>(() =>
    existing
      ? {
          code: existing.code,
          name: existing.name,
          type: existing.type,
          address: existing.address,
          city: existing.city,
          countryCode: existing.countryCode,
          currencyCode: existing.currencyCode,
          timezone: existing.timezone,
          description: existing.description,
          accent: existing.accent,
          status: existing.status,
        }
      : {
          code: "",
          name: "",
          type: "ROOMING_HOUSE",
          address: "",
          city: "",
          countryCode: "VN",
          currencyCode: defaultCurrency,
          timezone: "Asia/Ho_Chi_Minh",
          description: "",
          accent: colors.primaryTint,
          status: "ACTIVE",
        },
  );
  const [busy, setBusy] = useState(false);
  const patch = (p: Partial<PropertyDraft>) =>
    setDraft((s) => ({ ...s, ...p }));
  function save() {
    setBusy(true);
    const result = existing ? update(existing.id, draft) : add(draft);
    setBusy(false);
    if (!result.ok) return showAlert(t("CHUA_THE_LUU"), result.error);
    router.replace({
      pathname: "/(app)/property/[id]",
      params: { id: result.id },
    });
  }
  return (
    <Page>
      <PageHeader
        back
        title={existing ? t("SUA_BAT_DONG_SAN") : t("THEM_BAT_DONG_SAN")}
        subtitle={t("THONG_TIN_TONG_QUAT")}
      />
      <TextField
        label={t("TEN_BAT_DONG_SAN")}
        value={draft.name}
        required
        placeholder={t("VI_DU_SUNRISE_RESIDENCE")}
        onChangeText={(v) => patch({ name: v })}
      />
      <TextField
        label={t("MA_BAT_DONG_SAN")}
        value={draft.code}
        required
        placeholder={t("VI_DU_SUNRISE")}
        autoCapitalize="characters"
        onChangeText={(v) => patch({ code: v })}
      />
      <ChoiceField<PropertyType>
        label={t("LOAI_HINH")}
        value={draft.type}
        onChange={(v) => patch({ type: v })}
        options={[
          { value: "ROOMING_HOUSE", label: t("NHA_TRO") },
          { value: "APARTMENT_BUILDING", label: t("TOA_CAN_HO") },
          { value: "HOUSE", label: t("NHA") },
          { value: "OTHER", label: t("KHAC") },
        ]}
      />
      <TextField
        label={t("DIA_CHI")}
        value={draft.address}
        required
        placeholder={t("SO_NHA_DUONG_QUAN_HUYEN")}
        onChangeText={(v) => patch({ address: v })}
      />
      <TextField
        label={t("THANH_PHO")}
        value={draft.city}
        required
        placeholder={t("HO_CHI_MINH")}
        onChangeText={(v) => patch({ city: v })}
      />
      <ChoiceField
        label={t("QUOC_GIA")}
        value={draft.countryCode}
        onChange={(v) =>
          patch({
            countryCode: v,
            timezone:
              (
                {
                  VN: "Asia/Ho_Chi_Minh",
                  US: "America/New_York",
                  SG: "Asia/Singapore",
                  GB: "Europe/London",
                  AU: "Australia/Sydney",
                } as Record<string, string>
              )[v] || draft.timezone,
          })
        }
        options={[
          { value: "VN", label: "VN" },
          { value: "US", label: "US" },
          { value: "SG", label: "SG" },
          { value: "GB", label: "GB" },
          { value: "AU", label: "AU" },
        ]}
      />
      <ChoiceField
        label={t("TIEN_TE")}
        value={draft.currencyCode}
        onChange={(v) => patch({ currencyCode: v })}
        options={[
          { value: "VND", label: "VND" },
          { value: "USD", label: "USD" },
          { value: "SGD", label: "SGD" },
          { value: "GBP", label: "GBP" },
          { value: "AUD", label: "AUD" },
        ]}
      />
      <TextField
        label="Timezone (IANA)"
        value={draft.timezone}
        onChangeText={(v) => patch({ timezone: v })}
        placeholder="Asia/Ho_Chi_Minh"
        autoCapitalize="none"
      />
      <TextField
        label={t("MO_TA_KHONG_BAT_BUOC")}
        value={draft.description}
        onChangeText={(v) => patch({ description: v })}
        multiline
        placeholder={t("CAC_DAC_DIEM_NOI_BAT")}
      />
      <View className="mb-[20px]">
        <ActionButton
          title={existing ? t("LUU_THAY_DOI") : t("TAO_BAT_DONG_SAN")}
          icon="checkmark"
          onPress={save}
          loading={busy}
        />
      </View>
    </Page>
  );
}

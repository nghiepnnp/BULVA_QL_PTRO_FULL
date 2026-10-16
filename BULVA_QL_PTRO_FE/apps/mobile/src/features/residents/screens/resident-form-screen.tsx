import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { showAlert } from "@/components/ui/feedback";
import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ResidentDraft } from "@package/shared";
import {
  ActionButton,
  Page,
  PageHeader,
  TextField,
} from "@/components/ui/components";
import { useRentalStore } from "@/features/rentals/store/rental.store";
export default function ResidentFormScreen() {
  useLocale();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useRentalStore((s) => s.residents.find((r) => r.id === id));
  const add = useRentalStore((s) => s.addResident);
  const update = useRentalStore((s) => s.updateResident);
  const [draft, setDraft] = useState<ResidentDraft>(() =>
    existing
      ? {
          fullName: existing.fullName,
          phone: existing.phone,
          email: existing.email,
          emergencyContact: existing.emergencyContact,
          notes: existing.notes,
        }
      : { fullName: "", phone: "", email: "", emergencyContact: "", notes: "" },
  );
  function patch(p: Partial<ResidentDraft>) {
    setDraft((s) => ({ ...s, ...p }));
  }
  function save() {
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
      return showAlert(
        t("EMAIL_KHONG_HOP_LE"),
        t("VUI_LONG_KIEM_TRA_LAI_EMAIL"),
      );
    const result = existing ? update(existing.id, draft) : add(draft);
    if (!result.ok) return showAlert(t("KHONG_THE_LUU"), result.error);
    router.replace({
      pathname: "/(app)/resident/[id]",
      params: { id: result.id },
    });
  }
  return (
    <Page>
      <PageHeader
        back
        title={existing ? t("CHINH_SUA_NGUOI_THUE") : t("THEM_NGUOI_THUE")}
        subtitle={t("THONG_TIN_LIEN_HE_VA_CU_TRU")}
      />
      <TextField
        label={t("HO_VA_TEN")}
        required
        value={draft.fullName}
        onChangeText={(v) => patch({ fullName: v })}
        placeholder={t("VI_DU_NGUYEN_VAN_A")}
      />
      <TextField
        label={t("SO_DIEN_THOAI")}
        keyboardType="phone-pad"
        value={draft.phone}
        onChangeText={(v) => patch({ phone: v })}
        placeholder="+84..."
      />
      <TextField
        label={t("EMAIL")}
        keyboardType="email-address"
        autoCapitalize="none"
        value={draft.email}
        onChangeText={(v) => patch({ email: v })}
        placeholder="email@example.com"
      />
      <TextField
        label={t("LIEN_HE_KHAN_CAP")}
        value={draft.emergencyContact}
        onChangeText={(v) => patch({ emergencyContact: v })}
        placeholder={t("TEN_SO_DIEN_THOAI")}
      />
      <TextField
        label={t("GHI_CHU")}
        value={draft.notes}
        onChangeText={(v) => patch({ notes: v })}
        placeholder={t("THONG_TIN_BO_SUNG")}
        multiline
      />
      <View className="mt-[2px] mb-[30px]">
        <ActionButton
          title={existing ? t("LUU_THAY_DOI") : t("TAO_HO_SO")}
          icon="checkmark"
          onPress={save}
        />
      </View>
    </Page>
  );
}

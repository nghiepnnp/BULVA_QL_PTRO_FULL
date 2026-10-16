import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import type { UtilityDraft } from "@package/shared";
import {
  EmptyState,
  Page,
  PageHeader,
  Panel,
} from "@/components/ui/components";
import { UtilityEditor } from "@/features/utilities/components/utility-editor";
import { useRentalStore } from "@/features/rentals/store/rental.store";

export default function UtilityFormScreen() {
  useLocale();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useRentalStore((s) =>
    s.utilities.find((u) => u.id === id && u.active),
  );
  const defaultCurrency = useRentalStore((s) => s.defaultCurrency);
  const add = useRentalStore((s) => s.addUtility);
  const update = useRentalStore((s) => s.updateUtility);
  const onSave = (draft: UtilityDraft) => {
    const result = existing ? update(existing.id, draft) : add(draft);
    if (result.ok) router.replace("/(app)/utility");
    return result;
  };
  if (id && !existing)
    return (
      <Page>
        <PageHeader title={t("SUA_TIEN_ICH")} back />
        <EmptyState
          title={t("KHONG_TIM_THAY_TIEN_ICH")}
          description={t("TIEN_ICH_DA_BI_NGUNG_SU_DUNG_HOAC_KHONG_TON_TAI")}
        />
      </Page>
    );
  return (
    <Page>
      <PageHeader
        back
        title={existing ? t("SUA_TIEN_ICH") : t("THEM_TIEN_ICH")}
        subtitle={t("THIET_LAP_DON_GIA_DICH_VU_TUY_CHINH")}
      />
      {!!existing && (
        <Panel className="mb-[17px] bg-brand-soft">
          <Text className="text-[12px] leading-[19px] text-ink">
            {t("THAY_DOI_DON_GIA_HOAC_DON_VI_SE_DUOC_GHI_VAO_LICH")}
          </Text>
        </Panel>
      )}
      <UtilityEditor
        key={existing?.id || "new"}
        currencyCode={defaultCurrency}
        existing={existing}
        onSave={onSave}
      />
    </Page>
  );
}

import { t, type TranslationKey } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
const amenityOptions: { value: string; key: TranslationKey }[] = [
  { value: "Wi-Fi", key: "WI_FI" },
  { value: "Máy lạnh", key: "MAY_LANH" },
  { value: "Nhà vệ sinh riêng", key: "NHA_VE_SINH_RIENG" },
  { value: "Ban công", key: "BAN_CONG" },
  { value: "Bếp", key: "BEP" },
  { value: "Máy giặt", key: "MAY_GIAT" },
  { value: "Chỗ để xe", key: "CHO_DE_XE" },
];
import { showAlert } from "@/components/ui/feedback";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { UnitDraft, UnitType, UtilityDraft } from "@package/shared";
import {
  ActionButton,
  ChoiceField,
  EmptyState,
  Page,
  PageHeader,
  TextField,
} from "@/components/ui/components";
import {
  cleanAmenities,
  money,
  useRentalStore,
} from "@/features/rentals/store/rental.store";
import { UtilityEditor } from "@/features/utilities/components/utility-editor";
export default function UnitFormScreen() {
  useLocale();
  const router = useRouter();
  const { id, propertyId } = useLocalSearchParams<{
    id?: string;
    propertyId?: string;
  }>();
  const existing = useRentalStore((s) => s.units.find((u) => u.id === id));
  const resolvedPropertyId = existing?.propertyId || propertyId || "";
  const property = useRentalStore((s) =>
    s.properties.find(
      (p) => p.id === resolvedPropertyId && p.status === "ACTIVE",
    ),
  );
  const add = useRentalStore((s) => s.addUnit);
  const update = useRentalStore((s) => s.updateUnit);
  const addUtility = useRentalStore((s) => s.addUtility);
  const utilities = useRentalStore((s) => s.utilities);
  const availableUtilities = utilities.filter(
    (u) => u.active && u.currencyCode === property?.currencyCode,
  );
  // The editor is inline, so the in-progress Unit form is never unmounted or reset.
  // If there are no matching utilities, open the creation fields right away.
  const [showUtilityEditor, setShowUtilityEditor] = useState(
    () => availableUtilities.length === 0,
  );
  const [justAddedUtilityId, setJustAddedUtilityId] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState({
    propertyId: resolvedPropertyId,
    code: existing?.code || "",
    name: existing?.name || "",
    type: existing?.type || ("ROOM" as UnitType),
    floor: existing?.floor || "",
    areaM2: String(existing?.areaM2 ?? ""),
    capacity: String(existing?.capacity ?? 2),
    monthlyRent: String(existing?.monthlyRent ?? ""),
    status: existing?.status || ("ACTIVE" as "ACTIVE" | "UNAVAILABLE"),
    description: existing?.description || "",
    amenitiesText: (existing?.amenities || []).join(", "),
    utilityIds: existing?.utilityIds || ([] as string[]),
  });
  const patch = (p: Partial<typeof draft>) => setDraft((s) => ({ ...s, ...p }));
  function createUtility(utilityDraft: UtilityDraft) {
    const result = addUtility(utilityDraft);
    if (result.ok) {
      // Zustand notifies subscribers immediately; new option shows without page reload.
      // Auto-select it while preserving every other unsaved field in this Unit form.
      setDraft((current) => ({
        ...current,
        utilityIds: [...new Set([...current.utilityIds, result.id])],
      }));
      setJustAddedUtilityId(result.id);
      setShowUtilityEditor(false);
    }
    return result;
  }
  function save() {
    const { amenitiesText, ...fields } = draft;
    const payload: UnitDraft = {
      ...fields,
      areaM2: Number(draft.areaM2),
      capacity: Number(draft.capacity),
      monthlyRent: Number(draft.monthlyRent),
      amenities: cleanAmenities(amenitiesText.split(",")),
    };
    if (!draft.areaM2.trim() || !draft.monthlyRent.trim())
      return showAlert(
        t("THIEU_THONG_TIN"),
        t("VUI_LONG_NHAP_DIEN_TICH_VA_GIA_THUE"),
      );
    const result = existing ? update(existing.id, payload) : add(payload);
    if (!result.ok) return showAlert(t("CHUA_THE_LUU"), result.error);
    router.replace({ pathname: "/(app)/unit/[id]", params: { id: result.id } });
  }
  if (!property)
    return (
      <Page>
        <PageHeader title={t("THEM_PHONG")} back />
        <EmptyState
          title={t("KHONG_TIM_THAY_BAT_DONG_SAN")}
          description={t("HAY_MO_MOT_BAT_DONG_SAN_VA_CHON_THEM_PHONG")}
        />
      </Page>
    );
  return (
    <Page>
      <PageHeader
        back
        title={existing ? t("CHINH_SUA_PHONG") : t("THEM_PHONG")}
        subtitle={property.name}
      />
      <TextField
        label={t("TEN_PHONG")}
        required
        value={draft.name}
        onChangeText={(v) => patch({ name: v })}
        placeholder={t("VI_DU_PHONG_101")}
      />
      <TextField
        label={t("MA_PHONG")}
        required
        value={draft.code}
        onChangeText={(v) => patch({ code: v })}
        placeholder={t("VI_DU_P101")}
      />
      <ChoiceField<UnitType>
        label={t("LOAI_DON_VI_CHO_THUE")}
        value={draft.type}
        onChange={(v) => patch({ type: v })}
        options={[
          { value: "ROOM", label: t("PHONG") },
          { value: "APARTMENT", label: t("CAN_HO") },
          { value: "HOUSE", label: t("NHA") },
          { value: "OTHER", label: t("KHAC") },
        ]}
      />
      <TextField
        label={t("TANG_NEU_CO")}
        value={draft.floor}
        onChangeText={(v) => patch({ floor: v })}
        placeholder={t("VI_DU_1")}
      />
      <TextField
        label={t("DIEN_TICH_M")}
        required
        keyboardType="decimal-pad"
        value={draft.areaM2}
        onChangeText={(v) => patch({ areaM2: v })}
        placeholder={t("VI_DU_25")}
      />
      <TextField
        label={t("SUC_CHUA_TOI_DA")}
        required
        keyboardType="number-pad"
        value={draft.capacity}
        onChangeText={(v) => patch({ capacity: v })}
        placeholder={t("VI_DU_2")}
      />
      <TextField
        label={t("GIA_NIEM_YET_THANG_P0", { p0: property.currencyCode })}
        required
        keyboardType="numeric"
        value={draft.monthlyRent}
        onChangeText={(v) => patch({ monthlyRent: v })}
        placeholder={t("VI_DU_3500000")}
      />
      <ChoiceField
        label={t("TRANG_THAI_KHAI_THAC")}
        value={draft.status}
        onChange={(v) => patch({ status: v })}
        options={[
          { value: "ACTIVE", label: t("DANG_KHAI_THAC") },
          { value: "UNAVAILABLE", label: t("TAM_NGUNG") },
        ]}
      />
      <TextField
        label={t("TIEN_NGHI_PHONG_KHONG_THU_PHI_NGAN_CACH_BANG_DAU_PHAY")}
        value={draft.amenitiesText}
        onChangeText={(v) => patch({ amenitiesText: v })}
        placeholder={t("WI_FI_MAY_LANH_MAY_GIAT")}
      />
      <View className="flex-row flex-wrap gap-[7px] mt-[-9px] mb-[18px]">
        {amenityOptions.map(({ value: label, key }) => {
          const active = cleanAmenities(draft.amenitiesText.split(",")).some(
            (v) => v.toLocaleLowerCase() === label.toLocaleLowerCase(),
          );
          return (
            <Pressable
              key={label}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              onPress={() => {
                const current = cleanAmenities(draft.amenitiesText.split(","));
                patch({
                  amenitiesText: (active
                    ? current.filter(
                        (v) =>
                          v.toLocaleLowerCase() !== label.toLocaleLowerCase(),
                      )
                    : [...current, label]
                  ).join(", "),
                });
              }}
              className={`py-[7px] px-[10px] border rounded-[18px] ${active ? "bg-brand-soft border-brand" : "bg-surface border-line"}`}
            >
              <Text
                className={`text-[12px] font-semibold ${active ? "text-brand" : "text-muted"}`}
              >
                {active ? "✓ " : "+ "}
                {t(key)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mb-[17px]">
        <Text className="text-[14px] font-extrabold text-ink mb-[5px]">
          {t("TIEN_ICH_THU_PHI")}
        </Text>
        <Text className="text-[12px] text-muted mb-[12px] leading-[18px]">
          {t("CHON_TIEN_ICH_DA_KHAI_BAO_TRONG_CAI_DAT_TIEN_ICH_DON") + " "}
          {property.currencyCode}
          {t("CHUA_PHAT_SINH_HOA_DON")}
        </Text>
        {availableUtilities.length ? (
          availableUtilities.map((fee) => {
            const selected = draft.utilityIds.includes(fee.id);
            const recentlyAdded = justAddedUtilityId === fee.id;
            return (
              <Pressable
                key={fee.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  setJustAddedUtilityId(null);
                  patch({
                    utilityIds: selected
                      ? draft.utilityIds.filter((x) => x !== fee.id)
                      : [...draft.utilityIds, fee.id],
                  });
                }}
                className={`border rounded-[12px] p-[13px] mb-[8px] flex-row items-center gap-[10px] ${selected ? "bg-brand-soft border-brand" : "bg-surface border-line"}`}
              >
                <View
                  className={`w-[21px] h-[21px] border border-brand rounded-[6px] items-center justify-center ${selected ? "bg-brand-action" : "bg-surface"}`}
                >
                  {selected && (
                    <Text className="text-[14px] text-white font-black">✓</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-ink">
                    {fee.name}
                    {recentlyAdded ? " " + t("VUA_THEM") : ""}
                  </Text>
                  <Text className="text-[12px] text-muted mt-[4px]">
                    {money(fee.unitPrice, fee.currencyCode)}
                    {fee.chargeOnce
                      ? " " + t("DON_VI_MOI_LAN_CO_KHOANG_TRANG")
                      : ` / ${fee.inputUnit}`}
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <Text className="text-[12px] text-muted leading-[18px] mb-[12px]">
            {t("CHUA_CO_TIEN_ICH_NAO_BANG") + " "}
            {property.currencyCode}
            {t("BAN_CO_THE_THEM_NGAY_BEN_DUOI_MA_KHONG_CAN_THOAT_FORM")}
          </Text>
        )}
        {!showUtilityEditor && (
          <ActionButton
            title={t("THEM_TIEN_ICH_MOI")}
            variant="outline"
            icon="add-circle-outline"
            onPress={() => setShowUtilityEditor(true)}
          />
        )}
        {showUtilityEditor && (
          <View className="mt-[12px] border-brand border rounded-[16px] p-[14px] bg-surface">
            <Text className="text-[16px] font-extrabold text-ink mb-[5px]">
              {t("TAO_TIEN_ICH_NGAY_TAI_DAY")}
            </Text>
            <Text className="text-[12px] text-muted leading-[18px] mb-[17px]">
              {t("SAU_KHI_LUU_TIEN_ICH_SE_TU_HIEN_THI_VA_DUOC_CHON")}
            </Text>
            <UtilityEditor
              currencyCode={property.currencyCode}
              onSave={createUtility}
              onCancel={() => setShowUtilityEditor(false)}
              saveLabel={t("TAO_VA_CHON_TIEN_ICH")}
            />
          </View>
        )}
      </View>
      <TextField
        label={t("MO_TA")}
        value={draft.description}
        onChangeText={(v) => patch({ description: v })}
        placeholder={t("DAC_DIEM_CUA_PHONG")}
        multiline
      />
      <View className="mb-[20px]">
        <ActionButton
          title={existing ? t("LUU_THAY_DOI") : t("TAO_PHONG")}
          icon="checkmark"
          onPress={save}
        />
      </View>
    </Page>
  );
}

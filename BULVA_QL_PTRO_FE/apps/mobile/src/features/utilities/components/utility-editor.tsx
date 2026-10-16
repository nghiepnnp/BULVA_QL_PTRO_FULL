import { t, translateMessage } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useState } from "react";
import { Switch, Text, TextInput, View } from "react-native";
import type { UtilityDraft, UtilityDefinition } from "@package/shared";
import { ActionButton, Panel, TextField } from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import type { StoreResult } from "@/features/rentals/store/rental.store";

type Props = {
  currencyCode: string;
  existing?: UtilityDefinition;
  /** Parent handles saving; editor handles validation and displays any store error. */
  onSave: (draft: UtilityDraft) => StoreResult;
  onCancel?: () => void;
  saveLabel?: string;
};

/** Reusable in Settings and inline in Create/Edit Unit (no navigation, no lost Unit draft). */
export function UtilityEditor({
  currencyCode,
  existing,
  onSave,
  onCancel,
  saveLabel,
}: Props) {
  useLocale();
  const colors = useThemeColors();
  const [name, setName] = useState(existing?.name || "");
  const [chargeOnce, setChargeOnce] = useState(existing?.chargeOnce ?? true);
  const [inputUnit, setInputUnit] = useState(existing?.inputUnit || "");
  const [unitPrice, setUnitPrice] = useState(
    existing ? String(existing.unitPrice) : "",
  );
  const [error, setError] = useState("");
  const currency = existing?.currencyCode || currencyCode;
  const clearError = () => setError("");
  const maxDecimals = ["VND", "JPY", "KRW"].includes(currency) ? 0 : 2;

  function handleSave() {
    setError("");
    const priceText = unitPrice.trim().replace(",", ".");
    const pricePattern = maxDecimals === 0 ? /^\d+$/ : /^\d+(?:\.\d{1,2})?$/;
    if (!pricePattern.test(priceText)) {
      setError(
        t("DON_GIA_PHAI_LA_SO_KHONG_AM_TOI_DA_P0_CHU_SO", { p0: maxDecimals }),
      );
      return;
    }
    const draft: UtilityDraft = {
      name: name.trim(),
      chargeOnce,
      inputUnit: chargeOnce ? null : inputUnit.trim(),
      unitPrice: Number(priceText),
      currencyCode: currency,
    };
    const result = onSave(draft);
    if (!result.ok) setError(result.error);
  }

  return (
    <View>
      <TextField
        label={t("TEN_TIEN_ICH")}
        required
        value={name}
        onChangeText={(v) => {
          setName(v);
          clearError();
        }}
        placeholder={t("VI_DU_DIEN_NUOC_WI_FI_GUI_XE")}
      />
      <Panel className="mb-[18px]">
        <View className="flex-row items-center gap-[12px]">
          <View className="flex-1">
            <Text className="text-ink font-extrabold text-[14px]">
              {t("TINH_1_LAN")}
            </Text>
            <Text className="text-muted text-[12px] leading-[18px] mt-[6px]">
              {chargeOnce
                ? t("SO_LUONG_1_KHONG_CAN_DON_VI_WI_FI_GUI_XE")
                : t("SO_LUONG_THUC_TE_DON_GIA_DIEN_NUOC")}
            </Text>
          </View>
          <Switch
            accessibilityLabel={t("TINH_1_LAN")}
            value={chargeOnce}
            onValueChange={(v) => {
              setChargeOnce(v);
              clearError();
            }}
            trackColor={{ false: colors.line, true: colors.primaryTint }}
            thumbColor={chargeOnce ? colors.primary : colors.muted}
          />
        </View>
      </Panel>
      {!chargeOnce && (
        <TextField
          label={t("DON_VI_DAU_VAO")}
          required
          value={inputUnit}
          onChangeText={(v) => {
            setInputUnit(v);
            clearError();
          }}
          placeholder={t("VI_DU_KWH_KHOI_CHIEC")}
        />
      )}
      <View className="mb-[18px]">
        <Text className="font-bold text-[13px] text-ink mb-[8px]">
          {t("DON_GIA") + " "}
          <Text className="text-danger">*</Text>
        </Text>
        <View className="border border-line rounded-[13px] bg-surface min-h-[52px] flex-row items-center overflow-hidden">
          <TextInput
            accessibilityLabel={t("DON_GIA")}
            keyboardType="decimal-pad"
            value={unitPrice}
            onChangeText={(v) => {
              setUnitPrice(v);
              clearError();
            }}
            placeholder={t("VI_DU_3500")}
            placeholderTextColor={colors.disabled}
            className="flex-1 px-[14px] text-[15px] text-ink min-h-[52px]"
          />
          <View className="px-[15px] border-l border-line min-h-[52px] justify-center bg-brand-soft">
            <Text className="text-brand font-extrabold text-[14px]">
              {currency}
            </Text>
          </View>
        </View>
        <Text className="text-[12px] text-muted mt-[8px]">
          {chargeOnce
            ? t("TINH_CO_DINH_MOT_LAN_TRONG_MOI_KY_AP_DUNG")
            : t("DON_GIA_TREN_1_P0", { p0: inputUnit.trim() || "đơn vị" })}
        </Text>
      </View>
      {!!error && (
        <Text
          accessibilityRole="alert"
          className="text-danger mb-[14px] text-[13px]"
        >
          {translateMessage(error)}
        </Text>
      )}
      <View className="flex-row gap-[10px] mb-[8px]">
        {onCancel && (
          <View className="flex-1">
            <ActionButton
              title={t("HUY")}
              variant="outline"
              onPress={onCancel}
            />
          </View>
        )}
        <View className="flex-1">
          <ActionButton
            title={
              saveLabel || (existing ? t("LUU_THAY_DOI") : t("TAO_TIEN_ICH"))
            }
            icon="checkmark-outline"
            onPress={handleSave}
          />
        </View>
      </View>
    </View>
  );
}

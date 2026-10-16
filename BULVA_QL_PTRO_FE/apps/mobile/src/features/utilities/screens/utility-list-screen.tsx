import { t, translateMessage } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ActionButton,
  Badge,
  EmptyState,
  Icon,
  Page,
  PageHeader,
  Panel,
  SearchField,
  SectionHeading,
  SmallButton,
} from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { money, useRentalStore } from "@/features/rentals/store/rental.store";

export default function UtilityListScreen() {
  useLocale();
  const colors = useThemeColors();
  const router = useRouter();
  const utilities = useRentalStore((s) => s.utilities);
  const units = useRentalStore((s) => s.units);
  const archive = useRentalStore((s) => s.archiveUtility);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const active = useMemo(
    () =>
      utilities.filter(
        (u) =>
          u.active &&
          u.name
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()),
      ),
    [utilities, search],
  );

  const goCreate = () => router.push("/(app)/utility/form");
  return (
    <Page>
      <PageHeader
        back
        title={t("TIEN_ICH")}
        subtitle={t("CAU_HINH_DON_GIA_AP_DUNG_CHO_PHONG")}
        right={
          <SmallButton label={t("THEM_MOI")} icon="add" onPress={goCreate} />
        }
      />
      <Panel className="mb-[18px] bg-brand-soft">
        <View className="flex-row gap-[10px] items-start">
          <Icon
            name="information-circle-outline"
            size={21}
            color={colors.primary}
          />
          <Text className="flex-1 text-ink text-[12px] leading-[19px]">
            {t("KHAI_BAO_GIA_DIEN_NUOC_WI_FI_GUI_XE_TAI_DAY_CHON")}
          </Text>
        </View>
      </Panel>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t("TIM_THEO_TEN_TIEN_ICH")}
      />
      <SectionHeading
        title={t("DANH_SACH_TIEN_ICH_P0", { p0: active.length })}
      />
      {!active.length && (
        <EmptyState
          icon="flash-outline"
          title={search ? t("KHONG_CO_KET_QUA") : t("CHUA_CO_TIEN_ICH")}
          description={
            search
              ? t("HAY_THU_TU_KHOA_KHAC")
              : t("TAO_DON_GIA_CHO_DIEN_NUOC_WI_FI_VA_CAC_DICH_VU")
          }
          action={
            !search ? (
              <ActionButton title={t("TAO_TIEN_ICH")} onPress={goCreate} />
            ) : undefined
          }
        />
      )}
      {active.map((fee) => {
        const usage = units.filter(
          (u) =>
            u.status !== "ARCHIVED" && (u.utilityIds || []).includes(fee.id),
        ).length;
        return (
          <Panel key={fee.id} className="mb-[11px]">
            <View className="flex-row items-start gap-[12px]">
              <View className="w-[44px] h-[44px] rounded-[14px] bg-brand-soft items-center justify-center">
                <Icon
                  name={
                    fee.chargeOnce ? "receipt-outline" : "speedometer-outline"
                  }
                  color={colors.primary}
                  size={22}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-extrabold text-ink">
                  {fee.name}
                </Text>
                <Text className="text-[15px] font-extrabold text-brand mt-[6px]">
                  {money(fee.unitPrice, fee.currencyCode)}{" "}
                  <Text className="text-[12px] font-medium text-muted">
                    {fee.chargeOnce
                      ? t("DON_VI_MOI_LAN_CO_KHOANG_TRANG")
                      : `/ ${fee.inputUnit}`}
                  </Text>
                </Text>
              </View>
              <Badge
                label={fee.chargeOnce ? t("TINH_1_LAN") : t("THEO_SO_LUONG")}
                variant={fee.chargeOnce ? "primary" : "neutral"}
              />
            </View>
            <View className="flex-row justify-between items-center mt-[15px] pt-[13px] border-t border-line">
              <Text className="text-[12px] text-muted">
                {t("DA_GAN_VAO") + " "}
                {usage}
                {" " + t("PHONG_SO_LUONG")}
              </Text>
              <View className="flex-row gap-[13px] items-center">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError("");
                    setConfirmId(fee.id);
                  }}
                >
                  <Text className="text-danger text-[12px] font-bold">
                    {t("NGUNG_DUNG")}
                  </Text>
                </Pressable>
                <SmallButton
                  label={t("SUA")}
                  icon="create-outline"
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/utility/form",
                      params: { id: fee.id },
                    })
                  }
                />
              </View>
            </View>
            {confirmId === fee.id && (
              <View className="mt-[12px] p-[12px] bg-danger-soft rounded-[12px] gap-[10px]">
                <Text className="text-[12px] leading-[18px] text-ink">
                  {t("NGUNG_DUNG_MO_NGOAC")}
                  {fee.name}
                  {t("TIEN_ICH_SE_BI_GO_KHOI") + " "}
                  {usage}
                  {" " + t("PHONG_THAY_DOI_DUOC_LUU_VAO_LICH_SU_PHONG")}
                </Text>
                <View className="flex-row gap-[10px]">
                  <View className="flex-1">
                    <ActionButton
                      title={t("HUY")}
                      variant="outline"
                      onPress={() => setConfirmId(null)}
                    />
                  </View>
                  <View className="flex-1">
                    <ActionButton
                      title={t("XAC_NHAN")}
                      variant="danger"
                      onPress={() => {
                        const result = archive(fee.id);
                        setConfirmId(null);
                        if (!result.ok) setError(result.error);
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          </Panel>
        );
      })}
      {!!error && (
        <Text accessibilityRole="alert" className="text-danger text-[13px]">
          {translateMessage(error)}
        </Text>
      )}
      <View className="mt-[15px]">
        <ActionButton
          title={t("THEM_TIEN_ICH")}
          icon="add-circle-outline"
          onPress={goCreate}
        />
      </View>
    </Page>
  );
}

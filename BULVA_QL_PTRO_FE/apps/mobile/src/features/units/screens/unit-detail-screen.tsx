import {
  t,
  getIntlLocale,
  formatDate,
  historyValue,
  translateMessage,
} from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { showAlert } from "@/components/ui/feedback";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActionButton,
  Badge,
  DetailRow,
  EmptyState,
  Icon,
  Page,
  PageHeader,
  Panel,
  SectionHeading,
  SmallButton,
} from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { money, useRentalStore } from "@/features/rentals/store/rental.store";
export default function UnitDetailScreen() {
  useLocale();
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useRentalStore((s) =>
    s.units.find((u) => u.id === id && u.status !== "ARCHIVED"),
  );
  const property = useRentalStore((s) =>
    s.properties.find((p) => p.id === unit?.propertyId),
  );
  const occupancies = useRentalStore((s) => s.occupancies).filter(
    (o) => o.unitId === id && o.moveOutOn === null,
  );
  const residents = useRentalStore((s) => s.residents);
  const archive = useRentalStore((s) => s.archiveUnit);
  const utilities = useRentalStore((s) => s.utilities);
  const unitHistory = useRentalStore((s) => s.unitHistory);
  const history = unitHistory
    .filter((e) => e.unitId === id)
    .sort(
      (a, b) =>
        b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id),
    );
  if (!unit)
    return (
      <Page>
        <PageHeader back title={t("CHI_TIET_PHONG")} />
        <EmptyState
          title={t("KHONG_TIM_THAY_PHONG")}
          description={t("PHONG_DA_DUOC_LUU_TRU_HOAC_KHONG_TON_TAI")}
        />
      </Page>
    );
  const unavailable = unit.status === "UNAVAILABLE";
  return (
    <Page>
      <PageHeader
        back
        title={unit.name}
        subtitle={property?.name || t("DON_VI_CHO_THUE")}
        right={
          <SmallButton
            label={t("CHINH_SUA")}
            icon="create-outline"
            onPress={() =>
              router.push({
                pathname: "/(app)/unit/form",
                params: { id: unit.id },
              })
            }
          />
        }
      />
      <Panel className="mb-[15px]">
        <View className="flex-row items-center gap-[11px]">
          <View className="bg-brand-soft p-[12px] rounded-[14px]">
            <Icon name="bed-outline" color={colors.primary} size={27} />
          </View>
          <View className="flex-1">
            <Text className="font-extrabold text-[21px] text-ink">
              {money(unit.monthlyRent, property?.currencyCode || "VND")}
            </Text>
            <Text className="text-[12px] text-muted mt-[4px]">
              {t("GIA_NIEM_YET_THANG_CHUA_PHAI_GIA_HOP_DONG")}
            </Text>
          </View>
        </View>
        <View className="mt-[15px]">
          <Badge
            label={
              unavailable
                ? t("TAM_NGUNG")
                : occupancies.length
                  ? t("CO_NGUOI_O")
                  : t("CHUA_CO_NGUOI")
            }
            variant={
              unavailable ? "warn" : occupancies.length ? "success" : "neutral"
            }
          />
        </View>
      </Panel>
      <SectionHeading title={t("THONG_TIN_PHONG")} />
      <Panel>
        <DetailRow label={t("MA_DON_VI")} value={unit.code} />
        <DetailRow
          label={t("LOAI")}
          value={
            {
              ROOM: t("PHONG"),
              APARTMENT: t("CAN_HO"),
              HOUSE: t("NHA_NGUYEN_CAN"),
              OTHER: t("KHAC"),
            }[unit.type]
          }
        />
        <DetailRow label={t("TANG")} value={unit.floor} />
        <DetailRow label={t("DIEN_TICH")} value={`${unit.areaM2} m²`} />
        <DetailRow
          label={t("SUC_CHUA")}
          value={t("SO_LUONG_NGUOI", { p0: unit.capacity })}
        />
        <DetailRow label={t("GHI_CHU")} value={unit.description} />
      </Panel>
      <SectionHeading title={t("TIEN_ICH_TRONG_PHONG")} />
      <Panel>
        {unit.amenities?.length ? (
          <View className="flex-row flex-wrap gap-[8px]">
            {unit.amenities.map((amenity) => (
              <View
                key={amenity}
                className="rounded-[15px] py-[7px] px-[11px] bg-brand-soft"
              >
                <Text className="text-[12px] font-bold text-brand">
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-muted text-[13px]">
            {t("CHUA_KHAI_BAO_TIEN_ICH_CHON_CHINH_SUA_DE_THEM")}
          </Text>
        )}
      </Panel>
      <SectionHeading title={t("TIEN_ICH_THU_PHI")} />
      <Panel>
        {(unit.utilityIds || []).length ? (
          (unit.utilityIds || []).map((feeId) => {
            const fee = utilities.find((u) => u.id === feeId);
            if (!fee) return null;
            return (
              <View
                key={feeId}
                className="flex-row justify-between gap-[12px] py-[9px] border-b border-line"
              >
                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-ink">
                    {fee.name}
                  </Text>
                  <Text className="text-[11px] text-muted mt-[3px]">
                    {fee.chargeOnce
                      ? t("TINH_1_LAN")
                      : t("THEO_P0", { p0: fee.inputUnit })}
                  </Text>
                </View>
                <Text className="text-[13px] text-brand font-extrabold">
                  {money(fee.unitPrice, fee.currencyCode)}
                  {fee.chargeOnce ? "" : "/" + fee.inputUnit}
                </Text>
              </View>
            );
          })
        ) : (
          <Text className="text-muted text-[13px]">
            {t("CHUA_GAN_TIEN_ICH_THU_PHI_CHO_PHONG_NAY")}
          </Text>
        )}
      </Panel>
      <SectionHeading
        title={t("NGUOI_DANG_O_P0_P1", {
          p0: occupancies.length,
          p1: unit.capacity,
        })}
        right={
          !unavailable && occupancies.length < unit.capacity ? (
            <SmallButton
              label={t("NHAN_PHONG")}
              icon="person-add-outline"
              onPress={() =>
                router.push({
                  pathname: "/(app)/occupancy/form",
                  params: { unitId: unit.id },
                })
              }
            />
          ) : undefined
        }
      />
      {occupancies.map((o) => {
        const resident = residents.find((r) => r.id === o.residentId);
        return (
          <Panel key={o.id} className="mb-[10px]">
            <View className="flex-row items-center justify-between gap-[8px]">
              <View className="flex-1">
                <Text className="font-extrabold text-ink text-[14px]">
                  {resident?.fullName || t("NGUOI_THUE_KHONG_TON_TAI")}
                </Text>
                <Text className="text-[12px] text-muted mt-[5px]">
                  {t("NHAN_PHONG_NHAN") + " "}
                  {formatDate(o.moveInOn)}
                </Text>
              </View>
              <SmallButton
                label={t("CHI_TIET")}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/resident/[id]",
                    params: { id: o.residentId },
                  })
                }
              />
            </View>
          </Panel>
        );
      })}
      {!occupancies.length && (
        <EmptyState
          icon="people-outline"
          title={t("CHUA_GHI_NHAN_NGUOI_O")}
          description={t("THEM_NGUOI_CU_TRU_DE_THEO_DOI_TINH_TRANG_PHONG")}
          action={
            !unavailable ? (
              <ActionButton
                title={t("GHI_NHAN_NHAN_PHONG")}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/occupancy/form",
                    params: { unitId: unit.id },
                  })
                }
              />
            ) : undefined
          }
        />
      )}
      <SectionHeading
        title={t("LICH_SU_THAY_DOI_P0", { p0: history.length })}
      />
      {history.length ? (
        history.map((event) => (
          <Panel key={event.id} className="mb-[10px] p-[14px]">
            <View className="flex-row gap-[9px] items-start">
              <View className="p-[8px] rounded-[11px] bg-brand-soft">
                <Icon
                  name={
                    event.kind === "MOVE_IN"
                      ? "person-add-outline"
                      : event.kind === "MOVE_OUT"
                        ? "log-out-outline"
                        : event.kind === "UNIT_ARCHIVED"
                          ? "archive-outline"
                          : event.kind === "UTILITY_UPDATED"
                            ? "cash-outline"
                            : event.kind === "UTILITY_REMOVED"
                              ? "remove-circle-outline"
                              : event.kind === "UNIT_CREATED"
                                ? "add-circle-outline"
                                : "create-outline"
                  }
                  color={colors.primary}
                  size={18}
                />
              </View>
              <View className="flex-1">
                <Text className="text-ink font-extrabold text-[13px]">
                  {translateMessage(event.summary)}
                </Text>
                <Text className="text-[11px] text-muted mt-[3px]">
                  {new Date(event.occurredAt).toLocaleString(getIntlLocale(), {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
            {event.changes.map((change, index) => (
              <View
                key={`${event.id}-${index}`}
                className="border-t border-line mt-[10px] pt-[10px]"
              >
                <Text className="text-[12px] font-extrabold text-ink">
                  {translateMessage(change.field)}
                </Text>
                <Text className="text-muted text-[12px] mt-[4px]">
                  {historyValue(change.field, change.before)}
                </Text>
                <View className="flex-row items-center gap-[7px] mt-[3px]">
                  <Icon
                    name="arrow-forward-outline"
                    color={colors.primary}
                    size={14}
                  />
                  <Text className="text-[12px] text-brand flex-1 font-bold">
                    {historyValue(change.field, change.after)}
                  </Text>
                </View>
              </View>
            ))}
          </Panel>
        ))
      ) : (
        <EmptyState
          icon="time-outline"
          title={t("CHUA_CO_LICH_SU_THAY_DOI")}
          description={t("CAC_LAN_SUA_PHONG_NHAN_VA_TRA_NGUOI_O_SE_DUOC_LUU")}
        />
      )}
      <View className="mt-[17px]">
        <ActionButton
          title={t("LUU_TRU_PHONG")}
          variant="danger"
          icon="archive-outline"
          onPress={() =>
            showAlert(
              t("LUU_TRU_PHONG"),
              t("PHONG_SE_DUOC_AN_KHOI_DANH_SACH_QUAN_LY_THONG_THUONG"),
              [
                { text: t("HUY"), style: "cancel" },
                {
                  text: t("LUU_TRU"),
                  style: "destructive",
                  onPress: () => {
                    const r = archive(unit.id);
                    if (r.ok)
                      router.replace({
                        pathname: "/(app)/property/[id]",
                        params: { id: unit.propertyId },
                      });
                    else showAlert(t("KHONG_THE_LUU_TRU"), r.error);
                  },
                },
              ],
            )
          }
        />
      </View>
    </Page>
  );
}

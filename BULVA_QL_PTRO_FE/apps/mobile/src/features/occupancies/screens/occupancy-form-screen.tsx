import { t, translateMessage } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActionButton,
  EmptyState,
  Icon,
  Page,
  PageHeader,
  Panel,
  TextField,
} from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import {
  todayLocal,
  useRentalStore,
} from "@/features/rentals/store/rental.store";

export default function OccupancyFormScreen() {
  useLocale();
  const router = useRouter();
  const params = useLocalSearchParams<{
    residentId?: string;
    unitId?: string;
  }>();
  const residents = useRentalStore((s) => s.residents);
  const units = useRentalStore((s) => s.units);
  const properties = useRentalStore((s) => s.properties);
  const occupancies = useRentalStore((s) => s.occupancies);
  const recordMoveIns = useRentalStore((s) => s.recordMoveIns);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    params.residentId ? [params.residentId] : [],
  );
  const [unitId, setUnitId] = useState(params.unitId || "");
  const [date, setDate] = useState(todayLocal());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const selectedUnit = units.find((u) => u.id === unitId);
  const occupiedCount = occupancies.filter(
    (o) => o.unitId === unitId && o.moveOutOn === null,
  ).length;
  const spacesLeft = selectedUnit
    ? Math.max(0, selectedUnit.capacity - occupiedCount)
    : 0;
  const availableUnits = units.filter(
    (u) =>
      u.status === "ACTIVE" &&
      properties.some((p) => p.id === u.propertyId && p.status === "ACTIVE") &&
      occupancies.filter((o) => o.unitId === u.id && o.moveOutOn === null)
        .length < u.capacity,
  );
  const availableResidents = useMemo(
    () =>
      residents.filter(
        (r) =>
          (selectedIds.includes(r.id) ||
            !occupancies.some(
              (o) => o.residentId === r.id && o.moveOutOn === null,
            )) &&
          (r.fullName
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()) ||
            r.phone.includes(search.trim())),
      ),
    [residents, selectedIds, occupancies, search],
  );

  const selectedNames = selectedIds.map(
    (id) =>
      residents.find((r) => r.id === id)?.fullName ||
      t("NGUOI_THUE_KHONG_TON_TAI"),
  );
  const overCapacity = !!unitId && selectedIds.length > spacesLeft;
  function toggleResident(id: string) {
    setError("");
    if (selectedIds.includes(id)) {
      setSelectedIds((ids) => ids.filter((x) => x !== id));
      return;
    }
    if (unitId && selectedIds.length >= spacesLeft) {
      setError(
        t("PHONG_CHI_CON_P0_CHO_BO_CHON_NGUOI_KHAC_HOAC_DOI_PHONG", {
          p0: spacesLeft,
        }),
      );
      return;
    }
    setSelectedIds((ids) => [...ids, id]);
  }
  function save() {
    setError("");
    if (!unitId) return setError(t("HAY_CHON_PHONG_CON_CHO"));
    if (!selectedIds.length)
      return setError(t("HAY_CHON_IT_NHAT_MOT_NGUOI_THUE"));
    const result = recordMoveIns(selectedIds, unitId, date);
    if (!result.ok) return setError(result.error);
    router.replace({ pathname: "/(app)/unit/[id]", params: { id: unitId } });
  }

  return (
    <Page>
      <PageHeader
        title={t("NHAN_PHONG_NHIEU_NGUOI")}
        subtitle={t("CHON_MOT_PHONG_SAU_DO_CHON_NHIEU_NGUOI_CUNG_LUC")}
        back
      />
      <Text className="font-extrabold text-[15px] text-ink mb-[10px]">
        {t("NOI_DUNG_1_CHON_PHONG_CON_CHO")}
      </Text>
      {availableUnits.length ? (
        availableUnits.map((u) => {
          const count = occupancies.filter(
            (o) => o.unitId === u.id && o.moveOutOn === null,
          ).length;
          return (
            <ChoiceCard
              key={u.id}
              chosen={unitId === u.id}
              title={u.name}
              subtitle={t("P0_P1_P2_NGUOI_CON_P3_CHO", {
                p0: properties.find((p) => p.id === u.propertyId)?.name || "",
                p1: count,
                p2: u.capacity,
                p3: u.capacity - count,
              })}
              onPress={() => {
                setUnitId(u.id);
                setError("");
              }}
            />
          );
        })
      ) : (
        <EmptyState
          title={t("KHONG_CO_PHONG_CON_CHO")}
          description={t("HAY_TAO_PHONG_MOI_HOAC_CAP_NHAT_SUC_CHUA")}
        />
      )}

      <View className="mt-[17px] mb-[10px] flex-row justify-between items-center">
        <Text className="font-extrabold text-[15px] text-ink">
          {t("NOI_DUNG_2_CHON_NGUOI_THUE")}
        </Text>
        <Text
          className={`text-[12px] font-extrabold ${selectedIds.length > spacesLeft && !!unitId ? "text-danger" : "text-brand"}`}
        >
          {selectedIds.length}
          {unitId
            ? " " + t("P0_CHO_TRONG", { p0: spacesLeft })
            : " " + t("DA_CHON_HAU_TO")}
        </Text>
      </View>
      {!unitId && (
        <Text className="text-[12px] text-muted mb-[10px]">
          {t("CHON_PHONG_TRUOC_DE_KIEM_TRA_SO_LUONG_NGUOI_DUOC_CHON")}
        </Text>
      )}
      {!!selectedIds.length && (
        <Panel className="mb-[14px] p-[12px] bg-brand-soft">
          <Text className="text-[12px] font-extrabold text-brand mb-[5px]">
            {t("DA_CHON") + " "}
            {selectedIds.length}
            {" " + t("NGUOI")}
          </Text>
          <Text className="text-[12px] leading-[19px] text-ink">
            {selectedNames.join(" · ")}
          </Text>
        </Panel>
      )}
      <TextField
        label={t("TIM_NGUOI_THUE")}
        value={search}
        onChangeText={setSearch}
        placeholder={t("TIM_THEO_TEN_HOAC_SO_DIEN_THOAI")}
      />
      {availableResidents.length ? (
        availableResidents.map((r) => {
          const chosen = selectedIds.includes(r.id);
          return (
            <ChoiceCard
              key={r.id}
              chosen={chosen}
              disabled={!chosen && !!unitId && selectedIds.length >= spacesLeft}
              title={r.fullName}
              subtitle={r.phone}
              multiple
              onPress={() => toggleResident(r.id)}
            />
          );
        })
      ) : (
        <EmptyState
          title={t("KHONG_TIM_THAY_NGUOI_THUE")}
          description={t(
            "NGUOI_THUE_DANG_CU_TRU_O_PHONG_KHAC_HOAC_KHONG_KHOP_TU",
          )}
        />
      )}

      <View className="mt-[20px]">
        <TextField
          label={t("NGAY_NHAN_PHONG_YYYY_MM_DD")}
          value={date}
          onChangeText={setDate}
          required
          placeholder="2026-10-15"
        />
      </View>
      {overCapacity && (
        <Text className="text-danger mb-[10px] text-[12px]">
          {t("SO_NGUOI_DA_CHON_VUOT_QUA_SO_CHO_TRONG_CUA_PHONG")}
        </Text>
      )}
      {!!error && (
        <Panel className="mb-[12px] border-danger p-[12px]">
          <Text accessibilityRole="alert" className="text-danger text-[13px]">
            {translateMessage(error)}
          </Text>
        </Panel>
      )}
      <ActionButton
        title={t("XAC_NHAN_NHAN_PHONG_P0_NGUOI", { p0: selectedIds.length })}
        icon="checkmark-circle-outline"
        disabled={!unitId || !selectedIds.length || overCapacity}
        onPress={save}
      />
      <Text className="text-[11px] text-muted mt-[12px] text-center">
        {t("TOAN_BO_NGUOI_DUOC_CHON_SE_DUOC_GHI_NHAN_CUNG_MOT_LAN")}
      </Text>
    </Page>
  );
}

function ChoiceCard({
  chosen,
  title,
  subtitle,
  onPress,
  multiple = false,
  disabled = false,
}: {
  chosen: boolean;
  title: string;
  subtitle?: string;
  onPress: () => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole={multiple ? "checkbox" : "radio"}
      accessibilityState={{ checked: chosen, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`mb-[8px] ${disabled ? "opacity-50" : "opacity-100"}`}
    >
      <Panel
        className={`p-[12px] ${chosen ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
      >
        <View className="flex-row items-center gap-[10px]">
          <View className="flex-1">
            <Text className="text-[14px] font-extrabold text-ink">{title}</Text>
            {!!subtitle && (
              <Text className="text-[12px] text-muted mt-[4px]">
                {subtitle}
              </Text>
            )}
          </View>
          <Icon
            name={
              multiple
                ? chosen
                  ? "checkbox"
                  : "square-outline"
                : chosen
                  ? "radio-button-on"
                  : "radio-button-off"
            }
            color={chosen ? colors.primary : colors.disabled}
            size={23}
          />
        </View>
      </Panel>
    </Pressable>
  );
}

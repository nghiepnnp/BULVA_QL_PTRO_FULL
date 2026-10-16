import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import {
  ActionButton,
  EmptyState,
  Page,
  PageHeader,
  SearchField,
} from "@/components/ui/components";
import { PropertyCard } from "@/features/rentals/components/rental-cards";
import { useRentalStore } from "@/features/rentals/store/rental.store";

export default function PropertyListScreen() {
  useLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const properties = useRentalStore((s) => s.properties);
  const units = useRentalStore((s) => s.units);
  const occupancies = useRentalStore((s) => s.occupancies);
  const visible = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.status === "ACTIVE" &&
          (p.name + " " + p.code + " " + p.city)
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()),
      ),
    [properties, search],
  );
  return (
    <Page>
      <PageHeader
        title={t("BAT_DONG_SAN")}
        eyebrow={t("QUAN_LY_DANH_MUC")}
        right={
          <ActionButton
            compact
            icon="add"
            title={t("THEM")}
            onPress={() => router.push("/(app)/property/form")}
          />
        }
      />
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t("TEN_MA_HOAC_THANH_PHO")}
      />
      {visible.map((p) => {
        const my = units.filter(
          (u) => u.propertyId === p.id && u.status !== "ARCHIVED",
        );
        const occupied = my.filter((u) =>
          occupancies.some((o) => o.unitId === u.id && o.moveOutOn === null),
        ).length;
        return (
          <PropertyCard
            key={p.id}
            item={p}
            total={my.length}
            occupied={occupied}
            onPress={() =>
              router.push({
                pathname: "/(app)/property/[id]",
                params: { id: p.id },
              })
            }
          />
        );
      })}
      {!visible.length && (
        <EmptyState
          icon="business-outline"
          title={t("KHONG_TIM_THAY_BAT_DONG_SAN")}
          description={
            search
              ? t("THU_TU_KHOA_KHAC")
              : t("TAO_BAT_DONG_SAN_DAU_TIEN_DE_BAT_DAU_QUAN_LY_PHONG")
          }
        />
      )}
      <Text className="mt-[10px] text-center text-disabled text-[11px]">
        {t("BAT_DONG_SAN_DUOC_LUU_TRONG_DU_LIEU_MOCK_TREN_THIET_BI")}
      </Text>
    </Page>
  );
}

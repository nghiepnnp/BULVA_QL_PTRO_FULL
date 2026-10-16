import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { showAlert } from "@/components/ui/feedback";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActionButton,
  Badge,
  DetailRow,
  EmptyState,
  Page,
  PageHeader,
  Panel,
  SectionHeading,
  SmallButton,
} from "@/components/ui/components";
import { UnitCard } from "@/features/rentals/components/rental-cards";
import { useRentalStore } from "@/features/rentals/store/rental.store";

export default function PropertyDetailScreen() {
  useLocale();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filter, setFilter] = useState("all");
  const property = useRentalStore((s) =>
    s.properties.find((p) => p.id === id && p.status !== "ARCHIVED"),
  );
  const units = useRentalStore((s) => s.units).filter(
    (u) => u.propertyId === id && u.status !== "ARCHIVED",
  );
  const occ = useRentalStore((s) => s.occupancies);
  const archive = useRentalStore((s) => s.archiveProperty);
  if (!property)
    return (
      <Page>
        <PageHeader title={t("BAT_DONG_SAN")} back />
        <EmptyState
          title={t("KHONG_TIM_THAY")}
          description={t("BAT_DONG_SAN_NAY_KHONG_CON_TON_TAI")}
        />
      </Page>
    );
  const occupied = (unitId: string) =>
    occ.some((o) => o.unitId === unitId && o.moveOutOn === null);
  const visible = units.filter(
    (u) =>
      filter === "all" ||
      (filter === "occupied"
        ? occupied(u.id)
        : u.status === "ACTIVE" && !occupied(u.id)),
  );
  const addUnit = () =>
    router.push({
      pathname: "/(app)/unit/form",
      params: { propertyId: property.id },
    });
  return (
    <Page>
      <PageHeader
        back
        eyebrow={`${property.code} · ${property.countryCode}`}
        title={property.name}
        subtitle={property.address}
        right={
          <SmallButton
            label={t("SUA")}
            icon="create-outline"
            onPress={() =>
              router.push({
                pathname: "/(app)/property/form",
                params: { id: property.id },
              })
            }
          />
        }
      />
      <Panel>
        <View className="flex-row justify-between items-center">
          <Text className="text-[12px] text-muted">{t("TONG_DON_VI")}</Text>
          <Badge label={t("DANG_KHAI_THAC")} variant="success" />
        </View>
        <Text className="text-[31px] font-extrabold text-ink my-[7px]">
          {units.length}
        </Text>
        <Text className="text-[12px] text-muted">
          {property.currencyCode} · {property.timezone}
        </Text>
      </Panel>
      <SectionHeading
        title={t("PHONG_DON_VI")}
        right={
          <ActionButton
            compact
            icon="add"
            title={t("THEM")}
            onPress={addUnit}
          />
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
      >
        {[
          ["all", t("TAT_CA")],
          ["occupied", t("CO_NGUOI_O")],
          ["vacant", t("CHUA_CO_NGUOI_O")],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === value }}
            onPress={() => setFilter(value)}
            className={`py-[8px] px-[12px] rounded-[30px] border ${filter === value ? "border-brand bg-brand-action" : "border-line bg-surface"}`}
          >
            <Text
              className={`text-[12px] font-bold ${filter === value ? "text-white" : "text-neutral-ink"}`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {visible.map((u) => (
        <UnitCard
          key={u.id}
          item={u}
          currency={property.currencyCode}
          people={
            occ.filter((o) => o.unitId === u.id && o.moveOutOn === null).length
          }
          onPress={() =>
            router.push({ pathname: "/(app)/unit/[id]", params: { id: u.id } })
          }
        />
      ))}
      {!visible.length && (
        <EmptyState
          icon="bed-outline"
          title={
            units.length ? t("KHONG_CO_PHONG_PHU_HOP") : t("CHUA_CO_PHONG")
          }
          description={t("THAY_DOI_BO_LOC_HOAC_THEM_PHONG_MOI")}
          action={
            <ActionButton
              title={t("THEM_PHONG")}
              icon="add"
              onPress={addUnit}
            />
          }
        />
      )}
      <SectionHeading title={t("THONG_TIN")} />
      <Panel>
        <DetailRow
          label={t("LOAI_HINH")}
          value={
            (
              {
                ROOMING_HOUSE: t("NHA_TRO"),
                APARTMENT_BUILDING: t("TOA_NHA_CAN_HO"),
                HOUSE: t("NHA_NGUYEN_CAN"),
                OTHER: t("KHAC"),
              } as Record<string, string>
            )[property.type]
          }
        />
        <DetailRow label={t("DIA_CHI")} value={property.address} />
        <DetailRow label={t("THANH_PHO")} value={property.city} />
        <DetailRow label={t("QUOC_GIA")} value={property.countryCode} />
        <DetailRow label={t("TIEN_TE")} value={property.currencyCode} />
        <DetailRow label={t("MUI_GIO")} value={property.timezone} />
        {property.description ? (
          <DetailRow label={t("MO_TA")} value={property.description} />
        ) : null}
      </Panel>
      <View className="mt-[18px]">
        <ActionButton
          title={t("LUU_TRU_BAT_DONG_SAN")}
          variant="danger"
          icon="archive-outline"
          onPress={() =>
            showAlert(
              t("LUU_TRU_BAT_DONG_SAN"),
              t("BAN_PHAI_LUU_TRU_TAT_CA_CAC_PHONG_TRUOC_KHI_LUU_TRU"),
              [
                { text: t("HUY"), style: "cancel" },
                {
                  text: t("XAC_NHAN"),
                  style: "destructive",
                  onPress: () => {
                    const result = archive(property.id);
                    if (result.ok) router.back();
                    else showAlert(t("KHONG_THE_LUU_TRU"), result.error);
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

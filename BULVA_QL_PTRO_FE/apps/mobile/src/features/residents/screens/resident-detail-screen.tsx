import { t, formatDate } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { showAlert } from "@/components/ui/feedback";
import { Text, View } from "react-native";
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
import {
  todayLocal,
  useRentalStore,
} from "@/features/rentals/store/rental.store";
export default function ResidentDetailScreen() {
  useLocale();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = useRentalStore((s) => s.residents.find((r) => r.id === id));
  const occupancies = useRentalStore((s) => s.occupancies).filter(
    (o) => o.residentId === id,
  );
  const units = useRentalStore((s) => s.units);
  const moveOut = useRentalStore((s) => s.recordMoveOut);
  if (!person)
    return (
      <Page>
        <PageHeader back title={t("NGUOI_THUE")} />
        <EmptyState
          title={t("KHONG_TIM_THAY_NGUOI_THUE")}
          description={t("HO_SO_KHONG_TON_TAI")}
        />
      </Page>
    );
  const active = occupancies.find((o) => o.moveOutOn === null);
  function checkout(occupancyId: string) {
    showAlert(
      t("XAC_NHAN_TRA_PHONG"),
      t("GHI_NHAN_TRA_PHONG_VAO_NGAY_P0", { p0: todayLocal() }),
      [
        { text: t("HUY"), style: "cancel" },
        {
          text: t("TRA_PHONG"),
          style: "destructive",
          onPress: () => {
            const res = moveOut(occupancyId, todayLocal());
            if (!res.ok) showAlert(t("LOI"), res.error);
          },
        },
      ],
    );
  }
  return (
    <Page>
      <PageHeader
        back
        title={t("HO_SO_NGUOI_THUE")}
        right={
          <SmallButton
            label={t("CHINH_SUA")}
            icon="create-outline"
            onPress={() =>
              router.push({
                pathname: "/(app)/resident/form",
                params: { id: person.id },
              })
            }
          />
        }
      />
      <Panel>
        <View className="flex-row gap-[12px] items-center">
          <View className="h-[56px] w-[56px] rounded-[19px] bg-brand-soft items-center justify-center">
            <Text className="text-[23px] font-black text-brand">
              {person.fullName.slice(0, 1)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[20px] font-extrabold text-ink">
              {person.fullName}
            </Text>
            <View className="mt-[6px]">
              <Badge
                label={active ? t("DANG_CU_TRU") : t("CHUA_CU_TRU")}
                variant={active ? "success" : "neutral"}
              />
            </View>
          </View>
        </View>
      </Panel>
      <SectionHeading title={t("LIEN_HE")} />
      <Panel>
        <DetailRow label={t("DIEN_THOAI")} value={person.phone} />
        <DetailRow label={t("EMAIL")} value={person.email} />
        <DetailRow
          label={t("LIEN_HE_KHAN_CAP")}
          value={person.emergencyContact}
        />
        <DetailRow label={t("GHI_CHU")} value={person.notes} />
      </Panel>
      <SectionHeading
        title={t("LICH_SU_CU_TRU")}
        right={
          !active ? (
            <SmallButton
              icon="add"
              label={t("NHAN_PHONG")}
              onPress={() =>
                router.push({
                  pathname: "/(app)/occupancy/form",
                  params: { residentId: person.id },
                })
              }
            />
          ) : undefined
        }
      />
      {occupancies.map((o) => {
        const unit = units.find((u) => u.id === o.unitId);
        return (
          <Panel key={o.id} className="mb-[10px]">
            <View className="flex-row justify-between items-center">
              <Text className="text-[15px] font-extrabold text-ink">
                {unit?.name || t("PHONG_KHONG_TON_TAI")}
              </Text>
              <Badge
                label={o.moveOutOn ? t("DA_TRA_PHONG") : t("DANG_O")}
                variant={o.moveOutOn ? "neutral" : "success"}
              />
            </View>
            <Text className="text-[12px] text-muted mt-[9px]">
              {t("NHAN") + " "}
              {formatDate(o.moveInOn)}
              {"  " + t("TRA") + " "}
              {o.moveOutOn ? formatDate(o.moveOutOn) : t("CHUA_TRA")}
            </Text>
            {!o.moveOutOn && (
              <View className="mt-[14px]">
                <ActionButton
                  variant="outline"
                  icon="log-out-outline"
                  title={t("GHI_NHAN_TRA_PHONG_HOM_NAY")}
                  onPress={() => checkout(o.id)}
                />
              </View>
            )}
          </Panel>
        );
      })}
      {!occupancies.length && (
        <EmptyState
          title={t("CHUA_CO_LICH_SU_CU_TRU")}
          description={t("GHI_NHAN_NGUOI_THUE_VAO_PHONG_DE_CAP_NHAT_DASHBOARD")}
          action={
            <ActionButton
              title={t("GHI_NHAN_NHAN_PHONG")}
              onPress={() =>
                router.push({
                  pathname: "/(app)/occupancy/form",
                  params: { residentId: person.id },
                })
              }
            />
          }
        />
      )}
      <View className="h-[16px]" />
    </Page>
  );
}

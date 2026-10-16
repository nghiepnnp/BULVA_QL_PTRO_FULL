import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActionButton,
  EmptyState,
  Page,
  PageHeader,
  SearchField,
} from "@/components/ui/components";
import { ResidentCard } from "@/features/rentals/components/rental-cards";
import { useRentalStore } from "@/features/rentals/store/rental.store";
export default function ResidentListScreen() {
  useLocale();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const residents = useRentalStore((s) => s.residents);
  const units = useRentalStore((s) => s.units);
  const occupancy = useRentalStore((s) => s.occupancies);
  const filtered = useMemo(
    () =>
      residents.filter((r) =>
        `${r.fullName} ${r.email} ${r.phone}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase().trim()),
      ),
    [residents, search],
  );
  return (
    <Page>
      <PageHeader
        title={t("NGUOI_THUE")}
        eyebrow={t("HO_SO_VA_CU_TRU")}
        right={
          <ActionButton
            compact
            icon="add"
            title={t("THEM")}
            onPress={() => router.push("/(app)/resident/form")}
          />
        }
      />
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t("TEN_EMAIL_HOAC_SO_DIEN_THOAI")}
      />
      {filtered.map((r) => {
        const occ = occupancy.find(
          (o) => o.residentId === r.id && o.moveOutOn === null,
        );
        const u = units.find((u) => u.id === occ?.unitId);
        return (
          <ResidentCard
            key={r.id}
            item={r}
            unitName={u?.name}
            onPress={() =>
              router.push({
                pathname: "/(app)/resident/[id]",
                params: { id: r.id },
              })
            }
          />
        );
      })}
      {!filtered.length && (
        <EmptyState
          icon="people-outline"
          title={t("KHONG_TIM_THAY_NGUOI_THUE")}
          description={
            search
              ? t("HAY_THU_TIM_KIEM_BANG_THONG_TIN_KHAC")
              : t("THEM_NGUOI_THUE_DAU_TIEN_DE_QUAN_LY_HO_SO_VA_LICH")
          }
        />
      )}
    </Page>
  );
}

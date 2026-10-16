import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { useRouter } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import {
  Icon,
  type IconName,
  OwnerAvatar,
  Page,
  PageHeader,
  Panel,
  SectionHeading,
  SmallButton,
} from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { PropertyCard } from "@/features/rentals/components/rental-cards";
import { useRentalStore } from "@/features/rentals/store/rental.store";

export default function DashboardScreen() {
  useLocale();
  const colors = useThemeColors();
  const router = useRouter();
  // Read stable slices from Zustand. Derive display data outside the selector.
  const allProperties = useRentalStore((s) => s.properties);
  const allUnits = useRentalStore((s) => s.units);
  const allOccupancies = useRentalStore((s) => s.occupancies);
  const properties = allProperties.filter((p) => p.status === "ACTIVE");
  const units = allUnits.filter((u) => u.status !== "ARCHIVED");
  const occupancies = allOccupancies.filter((o) => o.moveOutOn === null);
  const occupiedIds = new Set(occupancies.map((o) => o.unitId));
  const occupied = units.filter((u) => occupiedIds.has(u.id)).length;
  const vacant = units.filter(
    (u) => u.status === "ACTIVE" && !occupiedIds.has(u.id),
  ).length;
  const unavailable = units.filter((u) => u.status === "UNAVAILABLE").length;
  const percent = units.length
    ? Math.round((occupied / units.length) * 100)
    : 0;

  return (
    <Page>
      <PageHeader
        eyebrow={t("CHAO_MUNG_TRO_LAI")}
        title={t("TONG_QUAN")}
        right={<OwnerAvatar />}
      />
      <View className="rounded-[23px]">
        <ImageBackground
          source={require("../../../assets/dashboard-hero-gradient.png")}
          resizeMode="stretch"
          imageStyle={{ borderRadius: 23 }}
          className="overflow-hidden rounded-[23px] bg-hero-start p-[21px]"
        >
          <View
            pointerEvents="none"
            className="absolute -right-9 -top-[70px] h-[200px] w-[200px] rounded-full bg-white/[0.05]"
          />
          <Text className="text-[13px] text-white opacity-80">
            {t("DANH_MUC_CHO_THUE")}
          </Text>
          <Text className="my-[2px] text-[40px] font-extrabold leading-[49px] tracking-[-1.6px] text-white">
            {units.length}{" "}
            <Text className="text-[17px] font-semibold tracking-normal text-white">
              {t("DON_VI", { count: units.length })}
            </Text>
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-white opacity-90">
              {t("TY_LE_DANG_CO_NGUOI_O")}
            </Text>
            <Text className="text-xs font-bold text-white opacity-90">
              {percent}%
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={t("TY_LE_DANG_CO_NGUOI_O")}
            accessibilityValue={{ min: 0, max: 100, now: percent }}
            className="mb-[11px] mt-[17px] h-[9px] overflow-hidden rounded-full bg-white/20"
          >
            <View
              className="h-full rounded-full bg-hero-progress"
              style={{ width: `${percent}%` }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-white opacity-90">
              {properties.length}
              {" " + t("BAT_DONG_SAN_SO_LUONG", { count: properties.length })}
            </Text>
            <Text className="text-xs text-white opacity-90">
              {t("DU_LIEU_DEMO")}
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View className="mt-[13px] flex-row gap-[10px]">
        <Metric
          label={t("DANG_CO_NGUOI_O")}
          value={occupied}
          icon="checkmark"
        />
        <Metric
          label={t("CHUA_CO_NGUOI_O")}
          value={vacant}
          icon="bed-outline"
          vacant
        />
      </View>
      {unavailable > 0 && (
        <Text className="mt-2 text-[11px] text-muted">
          {unavailable}
          {" " + t("DON_VI_TAM_NGUNG_KHAI_THAC", { count: unavailable })}
        </Text>
      )}

      <SectionHeading title={t("THAO_TAC_NHANH")} />
      <View className="flex-row gap-[10px]">
        <QuickAction
          label={t("THEM_NHA")}
          icon="business-outline"
          onPress={() => router.push("/(app)/property/form")}
        />
        <QuickAction
          label={t("THEM_PHONG")}
          icon="bed-outline"
          onPress={() => router.push("/(app)/(tabs)/properties")}
        />
        <QuickAction
          label={t("THEM_NGUOI_THUE")}
          icon="people-outline"
          onPress={() => router.push("/(app)/resident/form")}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("QUAN_LY_TIEN_ICH")}
        onPress={() => router.push("/(app)/utility")}
        className="mt-[10px] flex-row items-center gap-3 rounded-[15px] border border-line bg-surface p-[14px] active:opacity-70"
      >
        <View className="h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-brand-soft">
          <Icon name="flash-outline" color={colors.primary} size={20} />
        </View>
        <View className="flex-1">
          <Text className="text-[13px] font-bold text-ink">
            {t("QUAN_LY_TIEN_ICH")}
          </Text>
          <Text className="mt-1 text-[11px] text-muted">
            {t("DON_GIA_DIEN_NUOC_WI_FI_GUI_XE")}
          </Text>
        </View>
        <Icon name="chevron-forward" color={colors.muted} size={17} />
      </Pressable>
      <SectionHeading
        title={t("BAT_DONG_SAN")}
        right={
          <SmallButton
            label={t("XEM_TAT_CA")}
            onPress={() => router.push("/(app)/(tabs)/properties")}
          />
        }
      />
      {properties.slice(0, 3).map((p) => (
        <PropertyCard
          key={p.id}
          item={p}
          total={units.filter((u) => u.propertyId === p.id).length}
          occupied={
            units.filter((u) => u.propertyId === p.id && occupiedIds.has(u.id))
              .length
          }
          onPress={() =>
            router.push({
              pathname: "/(app)/property/[id]",
              params: { id: p.id },
            })
          }
        />
      ))}
      {!properties.length && (
        <Panel>
          <Text className="text-[13px] text-muted">
            {t("BAN_CHUA_CO_BAT_DONG_SAN_NAO_HAY_THEM_BAT_DONG_SAN")}
          </Text>
        </Panel>
      )}
      <Text className="mt-[23px] text-center text-[11px] text-disabled">
        {t("PHASE_1_1_CHI_SO_TIEN_THUE_HOA_DON_SE_CO_O")}
      </Text>
    </Page>
  );
}

function Metric({
  label,
  value,
  icon,
  vacant = false,
}: {
  label: string;
  value: number;
  icon: IconName;
  vacant?: boolean;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <View className="flex-1 rounded-[17px] border border-metric-line bg-surface p-[15px]">
      <View
        className={`h-[30px] w-[30px] items-center justify-center rounded-[10px] ${vacant ? "bg-vacant-soft" : "bg-brand-soft"}`}
      >
        <Icon
          name={icon}
          size={17}
          color={vacant ? colors.vacant : colors.primary}
        />
      </View>
      <Text className="mb-[2px] mt-[6px] text-[25px] font-extrabold text-ink">
        {value}
      </Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-1 items-center gap-[9px] rounded-[15px] border border-line bg-surface px-[5px] pb-[11px] pt-[14px] active:opacity-70"
    >
      <View className="h-[37px] w-[37px] items-center justify-center rounded-[13px] bg-brand-soft">
        <Icon name={icon} color={colors.primary} />
      </View>
      <Text className="text-center text-[11px] font-bold text-ink">
        {label}
      </Text>
    </Pressable>
  );
}

import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { ImageBackground, Pressable, Text, View } from "react-native";
import type { Property, Resident, Unit } from "@package/shared";
import { Badge, Icon, Panel } from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
import { money } from "../store/rental.store";

export function PropertyCard({
  item,
  total,
  occupied,
  onPress,
}: {
  item: Property;
  total: number;
  occupied: number;
  onPress: () => void;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-[11px] active:opacity-80"
    >
      <Panel className="flex-row items-center gap-3">
        <ImageBackground
          source={require("../../../assets/property-thumbnail-gradient.png")}
          resizeMode="stretch"
          imageStyle={{ borderRadius: 13 }}
          className="h-[66px] w-[66px] items-center justify-center overflow-hidden rounded-[13px] bg-thumbnail-start"
        >
          <Icon name="business-outline" size={30} color={colors.thumbnail} />
        </ImageBackground>
        <View className="min-w-0 flex-1">
          <Text
            className="text-sm font-extrabold leading-[19px] text-ink"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text
            className="mt-[5px] text-xs leading-[17px] text-muted"
            numberOfLines={2}
          >
            {item.address || item.city}
          </Text>
          <View className="mt-[9px] flex-row flex-wrap gap-[7px]">
            <Badge label={t("SO_LUONG_DON_VI", { p0: total })} />
            <Badge label={t("P0_DANG_O", { p0: occupied })} variant="success" />
          </View>
        </View>
        <Icon name="chevron-forward" size={17} color={colors.ink} />
      </Panel>
    </Pressable>
  );
}

export function UnitCard({
  item,
  currency,
  people,
  onPress,
}: {
  item: Unit;
  currency: string;
  people: number;
  onPress: () => void;
}) {
  useLocale();
  const colors = useThemeColors();
  const unavailable = item.status === "UNAVAILABLE";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mb-[11px] active:opacity-80"
    >
      <Panel className="flex-row items-center gap-3 rounded-2xl p-[13px]">
        <View className="h-[45px] w-[45px] items-center justify-center rounded-[13px] bg-unit-soft">
          <Icon name="bed-outline" color={colors.unit} size={23} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-extrabold leading-[19px] text-ink">
            {item.name}
          </Text>
          <Text className="mt-[5px] text-xs text-muted">
            {money(item.monthlyRent, currency)}
            {" " + t("THANG")}
          </Text>
        </View>
        <Badge
          label={
            unavailable
              ? t("TAM_NGUNG")
              : people > 0
                ? t("CO_NGUOI_O")
                : t("TRONG")
          }
          variant={unavailable ? "warn" : people > 0 ? "success" : "neutral"}
        />
      </Panel>
    </Pressable>
  );
}

export function ResidentCard({
  item,
  unitName,
  onPress,
}: {
  item: Resident;
  unitName?: string;
  onPress: () => void;
}) {
  useLocale();
  const colors = useThemeColors();
  const initials = item.fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-[11px] active:opacity-80"
    >
      <Panel className="flex-row items-center gap-3">
        <View className="h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-resident-soft">
          <Text className="text-base font-extrabold text-resident-ink">
            {initials}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-sm font-extrabold leading-[19px] text-ink"
            numberOfLines={1}
          >
            {item.fullName}
          </Text>
          <Text className="mt-[5px] text-xs text-muted" numberOfLines={1}>
            {item.phone || item.email || t("CHUA_CO_LIEN_HE")}
          </Text>
          <View className="mt-[9px] flex-row flex-wrap gap-[7px]">
            <Badge
              label={unitName || t("CHUA_NHAN_PHONG")}
              variant={unitName ? "success" : "neutral"}
            />
          </View>
        </View>
        <Icon name="chevron-forward" size={17} color={colors.ink} />
      </Panel>
    </Pressable>
  );
}

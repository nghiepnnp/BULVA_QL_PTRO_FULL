import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import type { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Ionicons>["color"];
}) {
  useLocale();
  const colors = useThemeColors();
  return <Ionicons name={name} size={size} color={color ?? colors.ink} />;
}

export function Page({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  useLocale();
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-[14px] pb-[110px]"
        contentContainerStyle={contentStyle}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function OwnerAvatar() {
  useLocale();
  const colors = useThemeColors();
  return (
    <View className="h-[39px] w-[39px] items-center justify-center rounded-[14px] bg-avatar-soft">
      <Icon name="person-outline" color={colors.avatarInk} size={21} />
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  back = false,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  right?: ReactNode;
  onBack?: () => void;
}) {
  useLocale();
  const router = useRouter();
  return (
    <View className="mb-[22px] min-h-[43px] flex-row items-center gap-3">
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("QUAY_LAI")}
          onPress={
            onBack ??
            (() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(app)/(tabs)/dashboard"))
          }
          className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-surface"
        >
          <Icon name="arrow-back" size={22} />
        </Pressable>
      )}
      <View className="flex-1">
        {!!eyebrow && (
          <Text className="mt-[3px] text-[13px] text-muted">{eyebrow}</Text>
        )}
        <Text className="text-[25px] font-extrabold tracking-[-0.5px] text-ink">
          {title}
        </Text>
        {!!subtitle && (
          <Text className="mt-[3px] text-[13px] text-muted">{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

export function ActionButton({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  compact = false,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
}) {
  useLocale();
  const colors = useThemeColors();
  const primary = variant === "primary";
  const isDanger = variant === "danger";
  const foreground = primary
    ? "#FFFFFF"
    : isDanger
      ? colors.red
      : colors.primary;
  const bgClass = primary
    ? "bg-brand-action"
    : isDanger
      ? "bg-danger-soft"
      : "bg-brand-soft";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-[9px] rounded-[14px] px-4 ${compact ? "h-9 rounded-[11px] px-[11px]" : "h-[51px]"} ${bgClass} ${disabled || loading ? "opacity-50" : "active:opacity-80"}`}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {icon && <Icon name={icon} color={foreground} size={19} />}
          <Text
            className={`text-[15px] font-bold ${primary ? "text-white" : isDanger ? "text-danger" : "text-brand"}`}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function SmallButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-[34px] flex-row items-center gap-1 rounded-[10px] bg-brand-soft px-[11px] active:opacity-80"
    >
      {icon && <Icon name={icon} size={16} color={colors.primary} />}
      <Text className="text-xs font-bold text-brand">{label}</Text>
    </Pressable>
  );
}

export function Panel({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  useLocale();
  return (
    <View
      className={`rounded-[18px] border border-line bg-surface p-[14px] ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}

export function SectionHeading({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  useLocale();
  return (
    <View className="mb-[13px] mt-[11px] flex-row items-center justify-between">
      <Text className="text-[17px] font-extrabold text-ink">{title}</Text>
      {right}
    </View>
  );
}

export function Badge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "success" | "warn" | "neutral" | "primary";
}) {
  useLocale();
  const classes = {
    success: "bg-brand-soft text-brand",
    warn: "bg-warning-soft text-warning",
    neutral: "bg-neutral-soft text-neutral-ink",
    primary: "bg-brand-soft text-brand",
  } as const;
  const [bg, ink] = classes[variant].split(" ");
  return (
    <View className={`self-start rounded-full px-[9px] py-[5px] ${bg}`}>
      <Text className={`text-[11px] font-bold ${ink}`}>{label}</Text>
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <View className="mb-[17px]">
      <Text className="mb-2 text-[13px] font-bold text-ink">
        {label}
        {required ? <Text className="text-danger"> *</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.disabled}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        className={`min-h-[51px] rounded-[13px] border border-line bg-surface px-[14px] text-[15px] text-ink ${multiline ? "h-[100px] pt-[14px]" : ""}`}
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
    </View>
  );
}

export function ChoiceField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  useLocale();
  return (
    <View className="mb-[17px]">
      <Text className="mb-2 text-[13px] font-bold text-ink">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              className={`rounded-[11px] border px-[13px] py-[10px] ${active ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
            >
              <Text
                className={`text-[13px] font-semibold ${active ? "text-brand" : "text-muted"}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder = t("TIM_KIEM_GOI_Y"),
}: {
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <View className="mb-4 flex-row items-center gap-[10px] rounded-[14px] border border-line bg-surface px-[14px]">
      <Icon name="search-outline" color={colors.muted} size={19} />
      <TextInput
        accessibilityLabel={t("TIM_KIEM")}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 py-3 text-sm text-ink"
        placeholderTextColor={colors.disabled}
        placeholder={placeholder}
      />
      {!!value && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityLabel={t("XOA_TIM_KIEM")}
        >
          <Icon name="close-circle" color={colors.disabled} />
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({
  icon = "file-tray-outline",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <View className="items-center gap-[10px] pb-[30px] pt-11">
      <View className="mb-2 h-[68px] w-[68px] items-center justify-center rounded-[23px] bg-brand-soft">
        <Icon name={icon} size={30} color={colors.primary} />
      </View>
      <Text className="text-[17px] font-extrabold text-ink">{title}</Text>
      <Text className="mb-[10px] text-center text-[13px] leading-5 text-muted">
        {description}
      </Text>
      {action}
    </View>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  useLocale();
  return (
    <View className="flex-row justify-between gap-[14px] border-b border-line py-[13px]">
      <Text className="flex-1 text-[13px] text-muted">{label}</Text>
      <Text className="flex-1 text-right text-[13px] font-bold text-ink">
        {value || "—"}
      </Text>
    </View>
  );
}

export function NavigationRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-line py-[14px] active:opacity-80"
    >
      <View className="h-[39px] w-[39px] items-center justify-center rounded-xl bg-brand-soft">
        <Icon name={icon} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink">{title}</Text>
        {!!subtitle && (
          <Text className="mt-1 text-xs text-muted">{subtitle}</Text>
        )}
      </View>
      <Icon name="chevron-forward" color={colors.disabled} />
    </Pressable>
  );
}

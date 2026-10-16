import type { ReactNode } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/ui/components';
import { useThemeColors } from '@/components/ui/theme';

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[1.4px] text-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-[18px] border border-line bg-surface px-4">
        {children}
      </View>
    </View>
  );
}
export function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  danger,
  last,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  danger?: boolean;
  last?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className={`min-h-[58px] flex-row items-center gap-3 py-[15px] active:opacity-60 ${last ? '' : 'border-b border-line'}`}
    >
      <Icon name={icon} size={20} color={danger ? colors.red : colors.muted} />
      <View className="flex-1">
        <Text className={`text-[14px] font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>
          {title}
        </Text>
        {subtitle && <Text className="mt-1 text-[11px] leading-4 text-muted">{subtitle}</Text>}
      </View>
      {value && <Text className="max-w-[85px] text-right text-[11px] text-muted">{value}</Text>}
      <Icon name="chevron-forward" size={15} color={colors.disabled} />
    </Pressable>
  );
}
export function PreferenceToggle({
  title,
  detail,
  value,
  onChange,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-4 border-b border-line py-4">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-ink">{title}</Text>
        <Text className="mt-1 text-xs leading-[18px] text-muted">{detail}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.line, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
export function Notice({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return (
    <View className={`mb-5 rounded-[14px] p-4 ${danger ? 'bg-danger-soft' : 'bg-brand-soft'}`}>
      <Text className={`text-xs leading-5 ${danger ? 'text-danger' : 'text-brand'}`}>
        {children}
      </Text>
    </View>
  );
}
export function Paragraph({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-bold text-ink">{title}</Text>
      <Text className="text-[13px] leading-[21px] text-muted">{children}</Text>
    </View>
  );
}

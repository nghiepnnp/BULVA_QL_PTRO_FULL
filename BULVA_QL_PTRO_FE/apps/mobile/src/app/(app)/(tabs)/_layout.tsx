import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, type ColorValue } from "react-native";
import { Icon, type IconName } from "@/components/ui/components";
import { useThemeColors } from "@/components/ui/theme";
export default function TabLayout() {
  useLocale();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelPosition: "below-icon",
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarIconStyle: { width: 53, height: 32 },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 11,
          lineHeight: 14,
          marginTop: 3,
          flexShrink: 0,
        },
        tabBarStyle: {
          height: 68 + insets.bottom,
          paddingTop: 9,
          paddingBottom: 9 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("TONG_QUAN"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: t("BAT_DONG_SAN"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "business" : "business-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="residents"
        options={{
          title: t("NGUOI_THUE"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("CAI_DAT"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  color: ColorValue;
  focused: boolean;
}) {
  useLocale();
  const colors = useThemeColors();
  return (
    <View
      style={{
        width: 53,
        height: 32,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.primaryTint : "transparent",
      }}
    >
      <Icon name={name} color={color} size={21} />
    </View>
  );
}

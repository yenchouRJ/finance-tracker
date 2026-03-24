import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useColorScheme } from 'react-native';

const TAB_ICON_SIZE = 24;

export default function TabLayout(): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeTint = '#3b82f6';
  const inactiveTint = isDark ? '#6b7280' : '#9ca3af';
  const tabBarBackground = isDark ? '#0a0a0a' : '#ffffff';
  const headerBackground = isDark ? '#0a0a0a' : '#ffffff';
  const headerTint = isDark ? '#ffffff' : '#000000';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: headerBackground,
        },
        headerTintColor: headerTint,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color: _color }) => (
            <MaterialCommunityIcons name="plus-circle" size={TAB_ICON_SIZE + 8} color={activeTint} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

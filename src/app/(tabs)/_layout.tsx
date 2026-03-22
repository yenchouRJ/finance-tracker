import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { Home, List, PlusCircle, PieChart, Settings } from '@tamagui/lucide-icons';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.blue10?.val || '#007AFF',
        tabBarInactiveTintColor: theme.gray8?.val || '#8E8E93',
        tabBarStyle: {
          backgroundColor: theme.background?.val || '#FFFFFF',
          borderTopColor: theme.borderColor?.val || '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: theme.background?.val || '#FFFFFF',
        },
        headerTintColor: theme.color?.val || '#000000',
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => <List color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <PieChart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

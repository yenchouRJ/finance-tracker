import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Card } from '@/components/ui';
import { useSettingsStore } from '@/stores/settings-store';
import { CURRENCIES, APP_VERSION } from '@/lib/constants';
import type { CurrencyCode } from '@/lib/constants';

type ThemeMode = 'dark' | 'light' | 'system';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'system', label: 'System', icon: 'cellphone' },
];

export default function SettingsScreen(): React.ReactElement {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const defaultCurrency = useSettingsStore((s) => s.defaultCurrency);
  const setDefaultCurrency = useSettingsStore((s) => s.setDefaultCurrency);

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 text-2xl font-bold text-white">Settings</Text>

        {/* Theme */}
        <Card variant="default" padding="lg" className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-300">
            Appearance
          </Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setTheme(option.value)}
                className={`flex-1 items-center rounded-xl py-3 ${
                  theme === option.value
                    ? 'bg-blue-500'
                    : 'bg-gray-800 active:bg-gray-700'
                }`}
              >
                <MaterialCommunityIcons
                  name={option.icon}
                  size={22}
                  color={theme === option.value ? '#ffffff' : '#9ca3af'}
                />
                <Text
                  className={`mt-1.5 text-xs font-medium ${
                    theme === option.value ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Default Currency */}
        <Card variant="default" padding="lg" className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-300">
            Default Currency
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr.code}
                onPress={() => setDefaultCurrency(curr.code as CurrencyCode)}
                className={`rounded-lg px-3 py-2 ${
                  defaultCurrency === curr.code
                    ? 'bg-blue-500'
                    : 'bg-gray-800 active:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    defaultCurrency === curr.code
                      ? 'text-white'
                      : 'text-gray-300'
                  }`}
                >
                  {curr.symbol} {curr.code}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Account (placeholder) */}
        <Card variant="default" padding="lg" className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-300">
            Account
          </Text>
          <Pressable className="flex-row items-center justify-between rounded-lg bg-gray-800 px-4 py-3 active:bg-gray-700">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="google" size={20} color="#9ca3af" />
              <Text className="ml-3 text-sm text-gray-300">
                Sign in with Google
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#6b7280"
            />
          </Pressable>
          <Text className="mt-2 text-xs text-gray-500">
            Sign in to sync your data across devices (coming soon)
          </Text>
        </Card>

        {/* Data & Sync (placeholder) */}
        <Card variant="default" padding="lg" className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-300">
            Data
          </Text>
          <Pressable className="flex-row items-center justify-between rounded-lg bg-gray-800 px-4 py-3 active:bg-gray-700">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="cloud-sync"
                size={20}
                color="#9ca3af"
              />
              <Text className="ml-3 text-sm text-gray-300">Cloud Sync</Text>
            </View>
            <Text className="text-xs text-gray-500">Coming soon</Text>
          </Pressable>
        </Card>

        {/* About */}
        <Card variant="outlined" padding="lg">
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-300">
              Finance Tracker
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              Version {APP_VERSION}
            </Text>
            <Text className="mt-3 text-center text-xs text-gray-600">
              An offline-first personal finance app built with Expo.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

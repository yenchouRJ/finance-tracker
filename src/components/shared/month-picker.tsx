import { useState, useCallback } from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Modal } from '@/components/ui';
import { parseMonthKey, formatMonth } from '@/lib/date';

type MonthPickerProps = {
  /** Current month in YYYY-MM format. */
  value: string;
  /** Called when the user selects a month, with YYYY-MM string. */
  onChange: (month: string) => void;
};

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Month picker with a popup calendar grid.
 * Tapping the month display opens a modal showing a 4x3 month grid for a year.
 * Navigation arrows change the year. Tapping a month selects it.
 */
export function MonthPicker({ value, onChange }: MonthPickerProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#9ca3af' : '#6b7280';

  const date = parseMonthKey(value);
  const displayText = formatMonth(date);

  const selectedYear = date.getFullYear();
  const selectedMonthIndex = date.getMonth(); // 0-based

  const [showPicker, setShowPicker] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);

  const handleOpen = useCallback((): void => {
    setViewYear(selectedYear);
    setShowPicker(true);
  }, [selectedYear]);

  const handleSelectMonth = useCallback(
    (monthIndex: number): void => {
      const month = String(monthIndex + 1).padStart(2, '0');
      onChange(`${viewYear}-${month}`);
      setShowPicker(false);
    },
    [viewYear, onChange],
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  return (
    <>
      {/* Trigger: month display with tap-to-open */}
      <Pressable
        onPress={handleOpen}
        className="flex-row items-center justify-center gap-2 rounded-lg px-4 py-2 active:bg-gray-200 dark:active:bg-gray-800"
        accessibilityLabel="Select month"
      >
        <MaterialCommunityIcons name="calendar-month" size={20} color={iconColor} />
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {displayText}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={iconColor} />
      </Pressable>

      {/* Month Grid Modal */}
      <Modal visible={showPicker} onClose={() => setShowPicker(false)}>
        {/* Year Navigation */}
        <View className="mb-4 flex-row items-center justify-center gap-4">
          <Pressable
            onPress={() => setViewYear((y) => y - 1)}
            className="rounded-full p-2 active:bg-gray-200 dark:active:bg-gray-800"
            accessibilityLabel="Previous year"
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={iconColor} />
          </Pressable>
          <Text className="min-w-[60px] text-center text-xl font-bold text-gray-900 dark:text-white">
            {viewYear}
          </Text>
          <Pressable
            onPress={() => setViewYear((y) => y + 1)}
            className="rounded-full p-2 active:bg-gray-200 dark:active:bg-gray-800"
            accessibilityLabel="Next year"
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={iconColor} />
          </Pressable>
        </View>

        {/* 4x3 Month Grid */}
        <View className="flex-row flex-wrap">
          {MONTH_LABELS.map((label, index) => {
            const isSelected =
              viewYear === selectedYear && index === selectedMonthIndex;
            const isCurrent =
              viewYear === currentYear && index === currentMonthIndex;

            return (
              <View key={label} className="w-1/4 items-center p-1">
                <Pressable
                  onPress={() => handleSelectMonth(index)}
                  className={`w-full items-center rounded-xl py-3 ${
                    isSelected
                      ? 'bg-blue-500'
                      : isCurrent
                        ? 'border border-blue-400'
                        : 'active:bg-gray-200 dark:active:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? 'font-bold text-white'
                        : isCurrent
                          ? 'font-semibold text-blue-500 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* This Month shortcut */}
        <Pressable
          onPress={() => {
            const month = String(currentMonthIndex + 1).padStart(2, '0');
            onChange(`${currentYear}-${month}`);
            setShowPicker(false);
          }}
          className="mt-4 items-center rounded-lg py-2 active:bg-gray-200 dark:active:bg-gray-800"
        >
          <Text className="text-sm font-medium text-blue-500 dark:text-blue-400">
            This Month
          </Text>
        </Pressable>
      </Modal>
    </>
  );
}

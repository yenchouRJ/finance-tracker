import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { parseMonthKey, formatMonth } from '@/lib/date';
import { addMonths, subMonths } from 'date-fns';

type MonthPickerProps = {
  value: string; // YYYY-MM format
  onChange: (month: string) => void;
};

/**
 * Month picker component showing MM/YYYY with left/right navigation arrows.
 */
export function MonthPicker({ value, onChange }: MonthPickerProps): React.ReactElement {
  const date = parseMonthKey(value);
  const displayText = formatMonth(date);

  const handlePrev = (): void => {
    const prev = subMonths(date, 1);
    const year = prev.getFullYear();
    const month = String(prev.getMonth() + 1).padStart(2, '0');
    onChange(`${year}-${month}`);
  };

  const handleNext = (): void => {
    const next = addMonths(date, 1);
    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, '0');
    onChange(`${year}-${month}`);
  };

  return (
    <View className="flex-row items-center justify-center gap-4">
      <Pressable
        onPress={handlePrev}
        className="rounded-full p-2 active:bg-gray-800"
        accessibilityLabel="Previous month"
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color="#9ca3af" />
      </Pressable>
      <Text className="min-w-[100px] text-center text-lg font-semibold text-white">
        {displayText}
      </Text>
      <Pressable
        onPress={handleNext}
        className="rounded-full p-2 active:bg-gray-800"
        accessibilityLabel="Next month"
      >
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
      </Pressable>
    </View>
  );
}

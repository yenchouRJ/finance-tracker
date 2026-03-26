import { useState, useMemo } from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  format,
} from 'date-fns';

import { Modal } from '@/components/ui';

type DatePickerProps = {
  /** Current date value in YYYY-MM-DD format. */
  value: string;
  /** Called when the user selects a date, with YYYY-MM-DD string. */
  onChange: (date: string) => void;
  /** Label shown above the date field. */
  label?: string;
  /** Error message to display. */
  error?: string;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Date picker with a popup calendar grid.
 * Tapping the date field opens a calendar showing one month at a time.
 * The user taps a day to select it. Navigation arrows change months.
 */
export function DatePicker({
  value,
  onChange,
  label = 'Date',
  error,
}: DatePickerProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#9ca3af' : '#6b7280';

  const selectedDate = new Date(value + 'T00:00:00');
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate);

  const displayText = format(selectedDate, 'dd/MM/yyyy');

  const handleOpen = (): void => {
    setViewDate(selectedDate);
    setShowPicker(true);
  };

  const handleSelectDay = (day: Date): void => {
    const dateStr = format(day, 'yyyy-MM-dd');
    onChange(dateStr);
    setShowPicker(false);
  };

  // Build calendar grid: 6 weeks x 7 days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calStart = startOfWeek(monthStart); // Sunday
    const calEnd = endOfWeek(monthEnd); // Saturday

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [viewDate]);

  return (
    <>
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">
            {label}
          </Text>
        )}
        <Pressable
          onPress={handleOpen}
          className="flex-row items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
        >
          <MaterialCommunityIcons name="calendar" size={20} color={iconColor} />
          <Text className="ml-3 flex-1 text-base text-gray-900 dark:text-white">{displayText}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={iconColor} />
        </Pressable>
        {error && (
          <Text className="mt-1 text-xs text-red-400">{error}</Text>
        )}
      </View>

      {/* Calendar Modal */}
      <Modal visible={showPicker} onClose={() => setShowPicker(false)}>
        {/* Month/Year Navigation */}
        <View className="mb-3 flex-row items-center justify-center gap-4">
          <Pressable
            onPress={() => setViewDate(subMonths(viewDate, 1))}
            className="rounded-full p-2 active:bg-gray-200 dark:active:bg-gray-800"
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={iconColor} />
          </Pressable>
          <Text className="min-w-[140px] text-center text-lg font-bold text-gray-900 dark:text-white">
            {format(viewDate, 'MMMM yyyy')}
          </Text>
          <Pressable
            onPress={() => setViewDate(addMonths(viewDate, 1))}
            className="rounded-full p-2 active:bg-gray-200 dark:active:bg-gray-800"
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={iconColor} />
          </Pressable>
        </View>

        {/* Day-of-week headers */}
        <View className="flex-row">
          {DAY_LABELS.map((dayLabel) => (
            <View key={dayLabel} className="flex-1 items-center py-1">
              <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">{dayLabel}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, viewDate);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <View key={index} className="w-[14.28%] items-center p-0.5">
                <Pressable
                  onPress={() => handleSelectDay(day)}
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    isSelected
                      ? 'bg-blue-500'
                      : isToday
                        ? 'border border-blue-400'
                        : 'active:bg-gray-200 dark:active:bg-gray-800'
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? 'font-bold text-white'
                        : isCurrentMonth
                          ? isToday
                            ? 'font-semibold text-blue-500 dark:text-blue-400'
                            : 'text-gray-900 dark:text-white'
                          : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Today shortcut */}
        <Pressable
          onPress={() => {
            const todayDate = new Date();
            onChange(format(todayDate, 'yyyy-MM-dd'));
            setShowPicker(false);
          }}
          className="mt-3 items-center rounded-lg py-2 active:bg-gray-200 dark:active:bg-gray-800"
        >
          <Text className="text-sm font-medium text-blue-500 dark:text-blue-400">Today</Text>
        </Pressable>
      </Modal>
    </>
  );
}

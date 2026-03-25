import { View, Text, Pressable } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '@/lib/categories';

type CategorySelectorProps = {
  type: 'income' | 'expense';
  selected: string | null;
  onSelect: (categoryKey: string) => void;
};

/**
 * Grid selector for transaction categories, filtered by income/expense type.
 */
export function CategorySelector({
  type,
  selected,
  onSelect,
}: CategorySelectorProps): React.ReactElement {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <View className="w-full">
      <View className="flex-row flex-wrap">
        {categories.map((cat) => {
          const isSelected = selected === cat.key;
          return (
            <View key={cat.key} className="w-1/4 items-center p-2">
              <Pressable
                onPress={() => onSelect(cat.key)}
                className={`h-16 w-16 items-center justify-center rounded-2xl ${
                  isSelected ? 'bg-blue-500' : 'bg-gray-800 active:bg-gray-700'
                }`}
                accessibilityLabel={cat.label}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={28}
                  color={isSelected ? '#ffffff' : '#9ca3af'}
                />
              </Pressable>
              <Text
                className={`mt-1.5 text-xs ${isSelected ? 'font-semibold text-blue-400' : 'text-gray-400'}`}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

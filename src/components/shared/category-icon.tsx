import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { getCategoryByKey } from '@/lib/categories';

type CategoryIconProps = {
  categoryKey: string;
  size?: number;
  color?: string;
  showLabel?: boolean;
};

/**
 * Renders a category icon with optional label.
 */
export function CategoryIcon({
  categoryKey,
  size = 24,
  color = '#9ca3af',
  showLabel = false,
}: CategoryIconProps): React.ReactElement {
  const category = getCategoryByKey(categoryKey);
  const icon = category?.icon ?? 'help-circle-outline';
  const label = category?.label ?? categoryKey;

  return (
    <View className="items-center">
      <MaterialCommunityIcons
        name={icon}
        size={size}
        color={color}
      />
      {showLabel && (
        <Text className="mt-1 text-xs text-gray-400" numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
}

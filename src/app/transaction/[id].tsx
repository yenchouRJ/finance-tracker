import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function EditTransactionScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-gray-950">
      <Text className="text-2xl font-semibold text-white">Edit Transaction</Text>
      <Text className="mt-2 text-sm text-gray-400">
        Editing transaction: {id}
      </Text>
    </View>
  );
}

import { View, Text } from 'react-native';

export default function StatsScreen(): React.ReactElement {
  return (
    <View className="flex-1 items-center justify-center bg-gray-950">
      <Text className="text-2xl font-semibold text-white">Statistics</Text>
      <Text className="mt-2 text-sm text-gray-400">
        Charts and spending insights
      </Text>
    </View>
  );
}

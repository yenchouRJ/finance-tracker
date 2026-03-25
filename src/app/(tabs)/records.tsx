import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  SectionList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MonthPicker } from '@/components/shared/month-picker';
import { CategoryIcon } from '@/components/shared/category-icon';
import { useTransactions } from '@/hooks/use-transactions';
import { useTransactionStore } from '@/stores/transaction-store';
import { useLedgerStore } from '@/stores/ledger-store';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import type { CurrencyCode } from '@/lib/constants';
import type { Transaction } from '@/types/transaction';

type TransactionSection = {
  title: string;
  dayTotal: { income: number; expense: number };
  data: Transaction[];
};

/**
 * Group transactions by date for SectionList.
 */
function groupByDate(transactions: Transaction[]): TransactionSection[] {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    const dateKey = t.date.substring(0, 10);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(t);
    } else {
      groups.set(dateKey, [t]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => {
    const income = items
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = items
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      title: formatDate(new Date(dateKey + 'T00:00:00')),
      dayTotal: { income, expense },
      data: items,
    };
  });
}

export default function RecordsScreen(): React.ReactElement {
  const router = useRouter();
  const { transactions, isLoading, currentMonth, setMonth, reload } =
    useTransactions();
  const removeTransaction = useTransactionStore((s) => s.remove);
  const activeLedger = useLedgerStore((s) => s.activeLedger);

  const currency = (activeLedger?.currency ?? 'TWD') as CurrencyCode;
  const sections = groupByDate(transactions);

  const handleDelete = useCallback(
    (id: string, note: string): void => {
      Alert.alert(
        'Delete Transaction',
        `Are you sure you want to delete "${note || 'this transaction'}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeTransaction(id);
              } catch (error) {
                console.error('[RecordsScreen] Failed to delete:', error);
                Alert.alert('Error', 'Failed to delete transaction.');
              }
            },
          },
        ],
      );
    },
    [removeTransaction],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }): React.ReactElement => (
      <Pressable
        onPress={() => router.push(`/transaction/${item.id}`)}
        className="flex-row items-center bg-gray-950 px-4 py-3 active:bg-gray-900"
      >
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-800">
          <CategoryIcon categoryKey={item.category} size={20} color="#9ca3af" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-white" numberOfLines={1}>
            {item.note || item.category}
          </Text>
          <Text className="text-xs text-gray-500">{item.category}</Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-sm font-semibold ${
              item.type === 'income' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {item.type === 'income' ? '+' : '-'}
            {formatCurrency(item.amount, currency)}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDelete(item.id, item.note)}
          className="ml-2 rounded-full p-1 active:bg-gray-800"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#6b7280" />
        </Pressable>
      </Pressable>
    ),
    [currency, handleDelete, router],
  );

  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: TransactionSection;
    }): React.ReactElement => (
      <View className="flex-row items-center justify-between bg-gray-950 px-4 py-2">
        <Text className="text-xs font-semibold text-gray-400">
          {section.title}
        </Text>
        <View className="flex-row gap-3">
          {section.dayTotal.income > 0 && (
            <Text className="text-xs text-green-500">
              +{formatCurrency(section.dayTotal.income, currency)}
            </Text>
          )}
          {section.dayTotal.expense > 0 && (
            <Text className="text-xs text-red-500">
              -{formatCurrency(section.dayTotal.expense, currency)}
            </Text>
          )}
        </View>
      </View>
    ),
    [currency],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <View className="px-4 pb-2 pt-4">
        <Text className="mb-4 text-2xl font-bold text-white">Records</Text>
        <MonthPicker value={currentMonth} onChange={setMonth} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <MaterialCommunityIcons
              name="receipt"
              size={48}
              color="#4b5563"
            />
            <Text className="mt-3 text-sm text-gray-500">
              No transactions this month
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
        contentContainerClassName="pb-4"
      />
    </SafeAreaView>
  );
}

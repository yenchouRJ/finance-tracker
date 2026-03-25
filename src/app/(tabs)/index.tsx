import { useCallback, useState } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Card } from '@/components/ui';
import { MonthPicker } from '@/components/shared/month-picker';
import { CategoryIcon } from '@/components/shared/category-icon';
import { useTransactions } from '@/hooks/use-transactions';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { useLedgerStore } from '@/stores/ledger-store';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import type { CurrencyCode } from '@/lib/constants';
import type { Transaction } from '@/types/transaction';

export default function HomeScreen(): React.ReactElement {
  const { transactions, isLoading, currentMonth, setMonth, reload } =
    useTransactions();
  const { summary } = useMonthlySummary();
  const activeLedger = useLedgerStore((s) => s.activeLedger);
  const ledgers = useLedgerStore((s) => s.ledgers);
  const setActiveLedger = useLedgerStore((s) => s.setActiveLedger);
  const [showLedgerPicker, setShowLedgerPicker] = useState(false);

  const currency = (activeLedger?.currency ?? 'TWD') as CurrencyCode;
  const balance = summary.totalIncome - summary.totalExpense;

  const recentTransactions = transactions.slice(0, 5);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }): React.ReactElement => (
      <View className="flex-row items-center px-4 py-3">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-800">
          <CategoryIcon categoryKey={item.category} size={20} color="#9ca3af" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-white" numberOfLines={1}>
            {item.note || item.category}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDate(new Date(item.date + 'T00:00:00'))}
          </Text>
        </View>
        <Text
          className={`text-sm font-semibold ${
            item.type === 'income' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount, currency)}
        </Text>
      </View>
    ),
    [currency],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor="#3b82f6"
          />
        }
        ListHeaderComponent={
          <View className="px-4 pb-2">
            {/* Ledger Switcher */}
            <Pressable
              onPress={() => setShowLedgerPicker(!showLedgerPicker)}
              className="mb-4 flex-row items-center"
            >
              <Text className="text-lg font-bold text-white">
                {activeLedger?.name ?? 'No Ledger'}
              </Text>
              <MaterialCommunityIcons
                name={showLedgerPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9ca3af"
                style={{ marginLeft: 4 }}
              />
            </Pressable>

            {showLedgerPicker && (
              <Card variant="outlined" padding="sm" className="mb-4">
                {ledgers.map((ledger) => (
                  <Pressable
                    key={ledger.id}
                    onPress={() => {
                      setActiveLedger(ledger.id);
                      setShowLedgerPicker(false);
                    }}
                    className={`rounded-lg px-3 py-2 ${
                      activeLedger?.id === ledger.id
                        ? 'bg-blue-500/20'
                        : 'active:bg-gray-800'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        activeLedger?.id === ledger.id
                          ? 'font-semibold text-blue-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {ledger.name}
                    </Text>
                  </Pressable>
                ))}
              </Card>
            )}

            {/* Month Picker */}
            <MonthPicker value={currentMonth} onChange={setMonth} />

            {/* Summary Cards */}
            <View className="mt-4 gap-3">
              {/* Balance Card */}
              <Card variant="elevated" padding="lg">
                <Text className="text-sm text-gray-400">Balance</Text>
                <Text
                  className={`mt-1 text-3xl font-bold ${
                    balance >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrency(balance, currency)}
                </Text>
              </Card>

              {/* Income / Expense Row */}
              <View className="flex-row gap-3">
                <Card variant="default" padding="md" className="flex-1">
                  <View className="flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                      <MaterialCommunityIcons
                        name="arrow-down"
                        size={16}
                        color="#4ade80"
                      />
                    </View>
                    <View>
                      <Text className="text-xs text-gray-400">Income</Text>
                      <Text className="text-base font-semibold text-green-400">
                        {formatCurrency(summary.totalIncome, currency)}
                      </Text>
                    </View>
                  </View>
                </Card>
                <Card variant="default" padding="md" className="flex-1">
                  <View className="flex-row items-center">
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                      <MaterialCommunityIcons
                        name="arrow-up"
                        size={16}
                        color="#f87171"
                      />
                    </View>
                    <View>
                      <Text className="text-xs text-gray-400">Expense</Text>
                      <Text className="text-base font-semibold text-red-400">
                        {formatCurrency(summary.totalExpense, currency)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            </View>

            {/* Recent Transactions Header */}
            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">
                Recent Transactions
              </Text>
              <Text className="text-xs text-gray-500">
                {summary.transactionCount} total
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <MaterialCommunityIcons
              name="cash-remove"
              size={48}
              color="#4b5563"
            />
            <Text className="mt-3 text-sm text-gray-500">
              No transactions this month
            </Text>
            <Text className="mt-1 text-xs text-gray-600">
              Tap the + button to add one
            </Text>
          </View>
        }
        contentContainerClassName="pb-4"
      />
    </SafeAreaView>
  );
}

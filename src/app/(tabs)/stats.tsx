import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-gifted-charts';

import { MonthPicker } from '@/components/shared/month-picker';
import { Card } from '@/components/ui';
import { useTransactions } from '@/hooks/use-transactions';
import { useLedgerStore } from '@/stores/ledger-store';
import {
  getCategoryBreakdown,
  getMonthlyTotals,
  type CategoryBreakdown,
  type MonthlyTotal,
} from '@/db/queries/transactions';
import { getCategoryByKey } from '@/lib/categories';
import { formatCurrency } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/constants';

const CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#6366f1',
  '#14b8a6',
  '#e11d48',
];

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen(): React.ReactElement {
  const { currentMonth, setMonth } = useTransactions();
  const activeLedger = useLedgerStore((s) => s.activeLedger);

  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdown[]>(
    [],
  );
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdown[]>(
    [],
  );
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);

  const currency = (activeLedger?.currency ?? 'TWD') as CurrencyCode;
  const year = currentMonth.substring(0, 4);

  useEffect(() => {
    async function loadStats(): Promise<void> {
      if (!activeLedger) return;
      try {
        const [expenses, incomes, totals] = await Promise.all([
          getCategoryBreakdown(activeLedger.id, currentMonth, 'expense'),
          getCategoryBreakdown(activeLedger.id, currentMonth, 'income'),
          getMonthlyTotals(activeLedger.id, year),
        ]);
        setExpenseBreakdown(expenses);
        setIncomeBreakdown(incomes);
        setMonthlyTotals(totals);
      } catch (error) {
        console.error('[StatsScreen] Failed to load stats:', error);
      }
    }
    loadStats();
  }, [activeLedger, currentMonth, year]);

  const totalExpense = expenseBreakdown.reduce((sum, c) => sum + c.total, 0);
  const totalIncome = incomeBreakdown.reduce((sum, c) => sum + c.total, 0);

  const pieData = expenseBreakdown.map((item, index) => ({
    value: item.total,
    color: CHART_COLORS[index % CHART_COLORS.length],
    text: getCategoryByKey(item.category)?.label ?? item.category,
  }));

  const barData = monthlyTotals.flatMap((m) => [
    {
      value: m.totalIncome,
      label: m.month.substring(5),
      frontColor: '#22c55e',
      spacing: 2,
    },
    {
      value: m.totalExpense,
      frontColor: '#ef4444',
      spacing: 16,
    },
  ]);

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-4 text-2xl font-bold text-white">Statistics</Text>
        <MonthPicker value={currentMonth} onChange={setMonth} />

        {/* Expense Pie Chart */}
        <Card variant="elevated" padding="lg" className="mt-6">
          <Text className="mb-4 text-base font-semibold text-white">
            Expense by Category
          </Text>
          {pieData.length > 0 ? (
            <View className="items-center">
              <PieChart
                data={pieData}
                donut
                radius={80}
                innerRadius={50}
                innerCircleColor="#111827"
                centerLabelComponent={() => (
                  <View className="items-center">
                    <Text className="text-xs text-gray-400">Total</Text>
                    <Text className="text-sm font-bold text-white">
                      {formatCurrency(totalExpense, currency)}
                    </Text>
                  </View>
                )}
              />
              {/* Legend */}
              <View className="mt-4 w-full flex-row flex-wrap">
                {expenseBreakdown.map((item, index) => (
                  <View
                    key={item.category}
                    className="mb-2 w-1/2 flex-row items-center"
                  >
                    <View
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <Text className="flex-1 text-xs text-gray-400" numberOfLines={1}>
                      {getCategoryByKey(item.category)?.label ?? item.category}
                    </Text>
                    <Text className="ml-1 text-xs text-gray-300">
                      {formatCurrency(item.total, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-sm text-gray-500">No expense data</Text>
            </View>
          )}
        </Card>

        {/* Income Summary */}
        <Card variant="elevated" padding="lg" className="mt-4">
          <Text className="mb-2 text-base font-semibold text-white">
            Income Summary
          </Text>
          {incomeBreakdown.length > 0 ? (
            <View>
              <Text className="mb-3 text-2xl font-bold text-green-400">
                {formatCurrency(totalIncome, currency)}
              </Text>
              {incomeBreakdown.map((item) => (
                <View
                  key={item.category}
                  className="flex-row items-center justify-between py-1.5"
                >
                  <Text className="text-sm text-gray-300">
                    {getCategoryByKey(item.category)?.label ?? item.category}
                  </Text>
                  <Text className="text-sm font-medium text-gray-200">
                    {formatCurrency(item.total, currency)} ({item.count})
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-sm text-gray-500">No income data</Text>
            </View>
          )}
        </Card>

        {/* Monthly Bar Chart */}
        <Card variant="elevated" padding="lg" className="mt-4">
          <Text className="mb-4 text-base font-semibold text-white">
            Monthly Overview ({year})
          </Text>
          {barData.length > 0 ? (
            <View>
              <BarChart
                data={barData}
                barWidth={12}
                spacing={8}
                xAxisColor="#4b5563"
                yAxisColor="#4b5563"
                yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                noOfSections={4}
                width={screenWidth - 96}
                hideRules
              />
              {/* Legend */}
              <View className="mt-3 flex-row items-center justify-center gap-6">
                <View className="flex-row items-center">
                  <View className="mr-1.5 h-3 w-3 rounded-sm bg-green-500" />
                  <Text className="text-xs text-gray-400">Income</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="mr-1.5 h-3 w-3 rounded-sm bg-red-500" />
                  <Text className="text-xs text-gray-400">Expense</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-sm text-gray-500">
                No data for {year}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

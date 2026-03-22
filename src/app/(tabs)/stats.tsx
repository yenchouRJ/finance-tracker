import React, { useState, useMemo } from "react";
import { ScrollView, Dimensions, StyleSheet } from "react-native";
import { YStack, XStack, Text, Button, Card, useTheme } from "tamagui";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useLedgerStore } from "@/stores/useLedgerStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { CartesianChart, Bar, PolarChart, Pie } from "victory-native";

const screenWidth = Dimensions.get("window").width;

export default function StatsTab() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { ledgers, activeLedgerId } = useLedgerStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const theme = useTheme();

  const activeLedger = ledgers.find((l) => l.id === activeLedgerId);

  const changeMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  const formatCurrency = (amount: number) => {
    const currency = activeLedger?.currency || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.occurredAt);
      return (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentDate]);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategory = useMemo(() => {
    const expenses = monthlyTransactions.filter((t) => t.type === "expense");
    const grouped = expenses.reduce(
      (acc, t) => {
        const catId = t.categoryId || "uncategorized";
        acc[catId] = (acc[catId] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .map(([id, amount]) => {
        const category = categories.find((c) => c.id === id);
        return {
          label: category ? category.name : "Uncategorized",
          value: amount,
          color: category?.color || theme.gray8?.val || "#888",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthlyTransactions, categories, theme]);

  const barData = [
    { type: "Income", amount: totalIncome },
    { type: "Expense", amount: totalExpense },
  ];

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} p="$4" bg="$background" gap="$4">
        {/* Month Picker */}
        <XStack jc="space-between" ai="center" mb="$4">
          <Button
            icon={<ChevronLeft size={20} />}
            circular
            size="$3"
            onPress={() => changeMonth(-1)}
          />
          <Text fontSize="$5" fontWeight="bold">
            {currentDate.toLocaleDateString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Button
            icon={<ChevronRight size={20} />}
            circular
            size="$3"
            onPress={() => changeMonth(1)}
          />
        </XStack>

        <Card
          p="$4"
          borderWidth={1}
          borderColor="$borderColor"
          bg="$backgroundHover"
        >
          <Text fontWeight="bold" fontSize="$6" mb="$2">
            Monthly Overview
          </Text>
          <XStack jc="space-between" mb="$2">
            <Text>Total Income</Text>
            <Text color="$green10" fontWeight="bold">
              +{formatCurrency(totalIncome)}
            </Text>
          </XStack>
          <XStack jc="space-between" mb="$2">
            <Text>Total Expense</Text>
            <Text color="$red10" fontWeight="bold">
              -{formatCurrency(totalExpense)}
            </Text>
          </XStack>
          <XStack
            jc="space-between"
            mt="$2"
            pt="$2"
            borderTopWidth={1}
            borderColor="$borderColor"
          >
            <Text fontWeight="bold">Net</Text>
            <Text
              fontWeight="bold"
              color={totalIncome >= totalExpense ? "$green10" : "$red10"}
            >
              {formatCurrency(totalIncome - totalExpense)}
            </Text>
          </XStack>
        </Card>

        {/* Charts */}
        {totalIncome > 0 || totalExpense > 0 ? (
          <YStack gap="$4" mt="$4">
            <Card
              p="$4"
              borderWidth={1}
              borderColor="$borderColor"
              bg="$backgroundHover"
              ai="center"
            >
              <Text
                fontWeight="bold"
                fontSize="$5"
                mb="$2"
                alignSelf="flex-start"
              >
                Income vs Expense
              </Text>
              <YStack width={screenWidth - 80} height={250}>
                <CartesianChart
                  data={barData}
                  xKey="type"
                  yKeys={["amount"]}
                  padding={10}
                  domainPadding={{ left: 50, right: 50, top: 30 }}
                >
                  {({ points, chartBounds }) => (
                    <Bar
                      points={points.amount}
                      chartBounds={chartBounds}
                      innerPadding={0.3}
                      roundedCorners={{ topLeft: 4, topRight: 4 }}
                      color={theme.blue10?.val || "blue"}
                    />
                  )}
                </CartesianChart>
              </YStack>
            </Card>

            {expensesByCategory.length > 0 && (
              <Card
                p="$4"
                borderWidth={1}
                borderColor="$borderColor"
                bg="$backgroundHover"
                ai="center"
              >
                <Text
                  fontWeight="bold"
                  fontSize="$5"
                  mb="$2"
                  alignSelf="flex-start"
                >
                  Expenses by Category
                </Text>
                <YStack width={screenWidth - 80} height={300}>
                  <PolarChart
                    data={expensesByCategory}
                    colorKey="color"
                    valueKey="value"
                    labelKey="label"
                  >
                    <Pie.Chart innerRadius={60}>
                      {() => <Pie.Slice />}
                    </Pie.Chart>
                  </PolarChart>
                </YStack>
                {/* Legend */}
                <YStack mt="$4" gap="$2" width="100%">
                  {expensesByCategory.map((item, index) => (
                    <XStack key={index} jc="space-between" ai="center">
                      <XStack ai="center" gap="$2">
                        <YStack
                          width={12}
                          height={12}
                          borderRadius={6}
                          backgroundColor={item.color as string}
                        />
                        <Text>{item.label}</Text>
                      </XStack>
                      <Text fontWeight="bold">
                        {formatCurrency(item.value)}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </Card>
            )}
          </YStack>
        ) : (
          <Card
            p="$4"
            borderWidth={1}
            borderColor="$borderColor"
            bg="$backgroundHover"
            mt="$4"
            ai="center"
            jc="center"
            minHeight={200}
          >
            <Text color="$gray10">No transactions found for this month.</Text>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}

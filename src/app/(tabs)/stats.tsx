import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useLedgerStore } from '@/stores/useLedgerStore';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';

export default function StatsTab() {
  const { transactions } = useTransactionStore();
  const { ledgers, activeLedgerId } = useLedgerStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const activeLedger = ledgers.find(l => l.id === activeLedgerId);

  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  const formatCurrency = (amount: number) => {
    const currency = activeLedger?.currency || 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} p="$4" bg="$background" gap="$4">
        {/* Month Picker */}
        <XStack jc="space-between" ai="center" mb="$4">
          <Button icon={<ChevronLeft size={20} />} circular size="$3" onPress={() => changeMonth(-1)} />
          <Text fontSize="$5" fontWeight="bold">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <Button icon={<ChevronRight size={20} />} circular size="$3" onPress={() => changeMonth(1)} />
        </XStack>

        <Card p="$4" borderWidth={1} borderColor="$borderColor" bg="$backgroundHover">
          <Text fontWeight="bold" fontSize="$6" mb="$2">Monthly Overview</Text>
          <XStack jc="space-between" mb="$2">
            <Text>Total Income</Text>
            <Text color="$green10" fontWeight="bold">+{formatCurrency(totalIncome)}</Text>
          </XStack>
          <XStack jc="space-between" mb="$2">
            <Text>Total Expense</Text>
            <Text color="$red10" fontWeight="bold">-{formatCurrency(totalExpense)}</Text>
          </XStack>
          <XStack jc="space-between" mt="$2" pt="$2" borderTopWidth={1} borderColor="$borderColor">
            <Text fontWeight="bold">Net</Text>
            <Text fontWeight="bold" color={totalIncome >= totalExpense ? '$green10' : '$red10'}>
              {formatCurrency(totalIncome - totalExpense)}
            </Text>
          </XStack>
        </Card>

        {/* Victory Charts placeholder */}
        <Card p="$4" borderWidth={1} borderColor="$borderColor" bg="$backgroundHover" mt="$4" ai="center" jc="center" minHeight={200}>
          <Text color="$gray10">Charts will be displayed here in Phase 5.</Text>
        </Card>
      </YStack>
    </ScrollView>
  );
}
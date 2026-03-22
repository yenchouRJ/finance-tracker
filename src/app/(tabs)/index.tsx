import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, H2, Card, Button, Spinner } from 'tamagui';
import { useLedgerStore } from '@/stores/useLedgerStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import { Transaction } from '@/types';

export default function HomeTab() {
  const { activeLedgerId, ledgers, fetchLedgers } = useLedgerStore();
  const { transactions, fetchTransactionsByMonth, isLoading } = useTransactionStore();

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // For MVP, using a hardcoded userId. In Phase 4, this comes from Firebase Auth.
    fetchLedgers('user-123');
  }, [fetchLedgers]);

  useEffect(() => {
    if (activeLedgerId) {
      fetchTransactionsByMonth(activeLedgerId, currentDate.getFullYear(), currentDate.getMonth() + 1);
    }
  }, [activeLedgerId, currentDate, fetchTransactionsByMonth]);

  const activeLedger = ledgers.find(l => l.id === activeLedgerId);

  const { income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    return { income: inc, expense: exp };
  }, [transactions]);

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

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} p="$4" gap="$4">
        {/* Ledger Header */}
        <XStack jc="space-between" ai="center">
          <YStack>
            <Text color="$gray10" fontSize="$3">Active Ledger</Text>
            <H2>{activeLedger?.name || 'Loading...'}</H2>
          </YStack>
          <Button size="$3" theme="active">Switch</Button>
        </XStack>

        {/* Month Picker */}
        <XStack jc="space-between" ai="center" mt="$4">
          <Button icon={<ChevronLeft size={20} />} circular size="$3" onPress={() => changeMonth(-1)} />
          <Text fontSize="$5" fontWeight="bold">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <Button icon={<ChevronRight size={20} />} circular size="$3" onPress={() => changeMonth(1)} />
        </XStack>

        {/* Summary Dashboard */}
        <XStack gap="$3" jc="space-between" mt="$2">
          <Card f={1} p="$3" borderWidth={1} borderColor="$borderColor" bg="$background" elevation="$2">
            <Text color="$gray10" fontSize="$2" mb="$1">Income</Text>
            <Text color="$green10" fontWeight="bold" fontSize="$6">
              {formatCurrency(income)}
            </Text>
          </Card>
          <Card f={1} p="$3" borderWidth={1} borderColor="$borderColor" bg="$background" elevation="$2">
            <Text color="$gray10" fontSize="$2" mb="$1">Expense</Text>
            <Text color="$red10" fontWeight="bold" fontSize="$6">
              {formatCurrency(expense)}
            </Text>
          </Card>
        </XStack>

        <Card p="$3" borderWidth={1} borderColor="$borderColor" bg="$background" elevation="$2" mt="$1">
          <Text color="$gray10" fontSize="$2" mb="$1">Net Balance</Text>
          <Text color={income - expense >= 0 ? '$green10' : '$red10'} fontWeight="bold" fontSize="$6">
            {formatCurrency(income - expense)}
          </Text>
        </Card>

        {/* Recent Transactions Preview */}
        <Text fontSize="$6" fontWeight="bold" mt="$4">Recent Transactions</Text>
        
        {isLoading ? (
          <Spinner size="large" mt="$4" color="$blue10" />
        ) : transactions.length === 0 ? (
          <Text color="$gray10" ta="center" mt="$4">No transactions this month.</Text>
        ) : (
          <YStack gap="$2">
            {transactions.slice(0, 5).map(t => (
              <XStack key={t.id} jc="space-between" ai="center" p="$3" bg="$background" borderRadius="$3" elevation="$1">
                <YStack>
                  <Text fontWeight="bold">{t.note || t.type}</Text>
                  <Text color="$gray10" fontSize="$2">
                    {new Date(t.occurredAt).toLocaleDateString()}
                  </Text>
                </YStack>
                <Text color={t.type === 'income' ? '$green10' : '$red10'} fontWeight="bold">
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}

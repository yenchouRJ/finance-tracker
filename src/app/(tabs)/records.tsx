import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button, Spinner } from 'tamagui';
import { useLedgerStore } from '@/stores/useLedgerStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { ChevronLeft, ChevronRight, Trash2 } from '@tamagui/lucide-icons';

export default function RecordsTab() {
  const { activeLedgerId, ledgers } = useLedgerStore();
  const { transactions, fetchTransactionsByMonth, deleteTransaction, isLoading } = useTransactionStore();

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (activeLedgerId) {
      fetchTransactionsByMonth(activeLedgerId, currentDate.getFullYear(), currentDate.getMonth() + 1);
    }
  }, [activeLedgerId, currentDate, fetchTransactionsByMonth]);

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

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <YStack f={1} p="$4" bg="$background">
      {/* Month Picker */}
      <XStack jc="space-between" ai="center" mb="$4">
        <Button icon={<ChevronLeft size={20} />} circular size="$3" onPress={() => changeMonth(-1)} />
        <Text fontSize="$5" fontWeight="bold">
          {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <Button icon={<ChevronRight size={20} />} circular size="$3" onPress={() => changeMonth(1)} />
      </XStack>

      <ScrollView style={{ flex: 1 }}>
        {isLoading ? (
          <Spinner size="large" mt="$4" color="$blue10" />
        ) : transactions.length === 0 ? (
          <Text color="$gray10" ta="center" mt="$4">No transactions found for this month.</Text>
        ) : (
          <YStack gap="$2">
            {transactions.map(t => (
              <XStack key={t.id} jc="space-between" ai="center" p="$3" bg="$backgroundHover" borderRadius="$3" elevation="$1">
                <YStack f={1}>
                  <Text fontWeight="bold">{t.note || t.type}</Text>
                  <Text color="$gray10" fontSize="$2">
                    {new Date(t.occurredAt).toLocaleDateString()}
                  </Text>
                </YStack>
                <XStack ai="center" gap="$3">
                  <Text color={t.type === 'income' ? '$green10' : '$red10'} fontWeight="bold">
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </Text>
                  <Button size="$2" theme="red" icon={<Trash2 size={16} />} onPress={() => handleDelete(t.id)} />
                </XStack>
              </XStack>
            ))}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}

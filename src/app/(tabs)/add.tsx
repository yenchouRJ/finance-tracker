import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionForm } from '@/components/forms/transaction-form';
import type { TransactionFormData } from '@/validators/transaction';
import { useTransactionStore } from '@/stores/transaction-store';
import { useLedgerStore } from '@/stores/ledger-store';

export default function AddScreen(): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const addTransaction = useTransactionStore((s) => s.add);
  const activeLedger = useLedgerStore((s) => s.activeLedger);

  const handleSubmit = async (data: TransactionFormData): Promise<void> => {
    if (!activeLedger) {
      Alert.alert('Error', 'No active ledger. Please create one first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        ledgerId: activeLedger.id,
        type: data.type,
        amount: data.amount,
        category: data.category,
        note: data.note,
        date: data.date,
      });
      setSuccess(true);
      // Reset success after a short delay
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('[AddScreen] Failed to add transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl">✓</Text>
          <Text className="mt-4 text-xl font-semibold text-green-400">
            Transaction Added!
          </Text>
          <Text className="mt-2 text-sm text-gray-400">
            Tap Add to create another
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <View className="flex-1 px-4 pt-4">
        <Text className="mb-6 text-2xl font-bold text-white">
          Add Transaction
        </Text>
        <TransactionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Add Transaction"
        />
      </View>
    </SafeAreaView>
  );
}

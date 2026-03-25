import { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TransactionForm } from '@/components/forms/transaction-form';
import type { TransactionFormData } from '@/validators/transaction';
import { useTransactionStore } from '@/stores/transaction-store';
import { getTransactionById } from '@/db/queries/transactions';
import type { Transaction } from '@/types/transaction';

export default function EditTransactionScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const updateTransaction = useTransactionStore((s) => s.update);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        if (!id) return;
        const t = await getTransactionById(id);
        setTransaction(t);
      } catch (error) {
        console.error('[EditTransaction] Failed to load:', error);
        Alert.alert('Error', 'Failed to load transaction.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = useCallback(
    async (data: TransactionFormData): Promise<void> => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        await updateTransaction(id, {
          type: data.type,
          amount: data.amount,
          category: data.category,
          note: data.note,
          date: data.date,
        });
        router.back();
      } catch (error) {
        console.error('[EditTransaction] Failed to update:', error);
        Alert.alert('Error', 'Failed to update transaction.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, updateTransaction, router],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950">
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-400">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-white">
            Transaction not found
          </Text>
          <Text className="mt-2 text-sm text-gray-400">
            It may have been deleted.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['bottom']}>
      <View className="flex-1 px-4 pt-4">
        <TransactionForm
          defaultValues={{
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            note: transaction.note,
            date: transaction.date.substring(0, 10),
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Transaction"
        />
      </View>
    </SafeAreaView>
  );
}

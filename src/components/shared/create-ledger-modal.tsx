import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { Modal, Input, Button } from '@/components/ui';
import { useLedgerStore } from '@/stores/ledger-store';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/constants';

type CreateLedgerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function CreateLedgerModal({
  visible,
  onClose,
}: CreateLedgerModalProps): React.ReactElement {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const add = useLedgerStore((s) => s.add);
  const setActiveLedger = useLedgerStore((s) => s.setActiveLedger);

  const handleCreate = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Ledger name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const ledger = await add({ name: trimmed, currency });
      setActiveLedger(ledger.id);
      resetAndClose();
    } catch (err) {
      console.error('[CreateLedgerModal] Failed to create ledger:', err);
      setError('Failed to create ledger. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = (): void => {
    setName('');
    setCurrency(DEFAULT_CURRENCY);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={resetAndClose}>
      <Text className="mb-4 text-lg font-bold text-white">New Ledger</Text>

      <Input
        label="Ledger Name"
        placeholder="e.g. Personal, Travel, Business"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error) setError('');
        }}
        error={error}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleCreate}
      />

      <Text className="mb-2 mt-4 text-sm font-medium text-gray-300">Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <View className="flex-row gap-2">
          {CURRENCIES.map((c) => (
            <Pressable
              key={c.code}
              onPress={() => setCurrency(c.code)}
              className={`rounded-lg px-3 py-2 ${
                currency === c.code
                  ? 'bg-blue-500/20 border border-blue-500'
                  : 'bg-gray-800 border border-gray-700 active:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm ${
                  currency === c.code ? 'font-semibold text-blue-400' : 'text-gray-300'
                }`}
              >
                {c.symbol} {c.code}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button title="Cancel" variant="ghost" fullWidth onPress={resetAndClose} />
        </View>
        <View className="flex-1">
          <Button
            title="Create"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            onPress={handleCreate}
          />
        </View>
      </View>
    </Modal>
  );
}

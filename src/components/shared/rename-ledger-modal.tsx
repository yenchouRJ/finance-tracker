import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

import { Modal, Input, Button } from '@/components/ui';
import { useLedgerStore } from '@/stores/ledger-store';
import type { Ledger } from '@/types/ledger';

type RenameLedgerModalProps = {
  visible: boolean;
  ledger: Ledger | null;
  onClose: () => void;
};

export function RenameLedgerModal({
  visible,
  ledger,
  onClose,
}: RenameLedgerModalProps): React.ReactElement {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = useLedgerStore((s) => s.update);

  useEffect(() => {
    if (visible && ledger) {
      setName(ledger.name);
      setError('');
    }
  }, [visible, ledger]);

  const handleRename = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Ledger name is required');
      return;
    }
    if (ledger && trimmed === ledger.name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (ledger) {
        await update(ledger.id, { name: trimmed });
      }
      onClose();
    } catch (err) {
      console.error('[RenameLedgerModal] Failed to rename ledger:', err);
      setError('Failed to rename ledger. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text className="mb-4 text-lg font-bold text-white">Rename Ledger</Text>

      <Input
        label="Ledger Name"
        placeholder="Enter new name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (error) setError('');
        }}
        error={error}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleRename}
      />

      <View className="mt-6 flex-row gap-3">
        <View className="flex-1">
          <Button title="Cancel" variant="ghost" fullWidth onPress={onClose} />
        </View>
        <View className="flex-1">
          <Button
            title="Save"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            onPress={handleRename}
          />
        </View>
      </View>
    </Modal>
  );
}

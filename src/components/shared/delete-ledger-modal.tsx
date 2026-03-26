import { useState } from 'react';
import { View, Text } from 'react-native';

import { Modal, Button } from '@/components/ui';
import { useLedgerStore } from '@/stores/ledger-store';
import type { Ledger } from '@/types/ledger';

type DeleteLedgerModalProps = {
  visible: boolean;
  ledger: Ledger | null;
  onClose: () => void;
};

export function DeleteLedgerModal({
  visible,
  ledger,
  onClose,
}: DeleteLedgerModalProps): React.ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const remove = useLedgerStore((s) => s.remove);
  const ledgers = useLedgerStore((s) => s.ledgers);

  const handleDelete = async (): Promise<void> => {
    if (!ledger) return;

    setIsDeleting(true);
    setError('');
    try {
      await remove(ledger.id);
      onClose();
    } catch (err) {
      console.error('[DeleteLedgerModal] Failed to delete ledger:', err);
      setError('Failed to delete ledger. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLastLedger = ledgers.length <= 1;

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text className="mb-2 text-lg font-bold text-white">Delete Ledger</Text>

      {isLastLedger ? (
        <Text className="mb-6 text-sm leading-5 text-gray-400">
          You cannot delete your only ledger. Create another ledger first.
        </Text>
      ) : (
        <Text className="mb-6 text-sm leading-5 text-gray-400">
          Are you sure you want to delete{' '}
          <Text className="font-semibold text-white">{ledger?.name}</Text>? All transactions in this
          ledger will be removed. This action cannot be undone.
        </Text>
      )}

      {error ? <Text className="mb-4 text-sm text-red-400">{error}</Text> : null}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            title={isLastLedger ? 'OK' : 'Cancel'}
            variant="ghost"
            fullWidth
            onPress={onClose}
          />
        </View>
        {!isLastLedger ? (
          <View className="flex-1">
            <Button
              title="Delete"
              variant="danger"
              fullWidth
              loading={isDeleting}
              onPress={handleDelete}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

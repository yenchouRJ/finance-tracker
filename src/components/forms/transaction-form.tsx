import { View, Text, Pressable, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Input } from '@/components/ui';
import { CategorySelector } from '@/components/shared/category-selector';
import { DatePicker } from '@/components/shared/date-picker';
import {
  transactionSchema,
  type TransactionFormData,
} from '@/validators/transaction';
import { MAX_NOTE_LENGTH } from '@/lib/constants';
import type { TransactionType } from '@/types/transaction';

type TransactionFormProps = {
  /** Pre-fill values for editing. */
  defaultValues?: Partial<TransactionFormData>;
  /** Called on successful form submission. */
  onSubmit: (data: TransactionFormData) => Promise<void>;
  /** Label for submit button (e.g. "Add" or "Update"). */
  submitLabel?: string;
  /** Whether the form is currently submitting. */
  isSubmitting?: boolean;
};

/**
 * Transaction form with type toggle, amount, category selector, date picker, and note.
 * Uses react-hook-form + zod validation.
 */
export function TransactionForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Add Transaction',
  isSubmitting = false,
}: TransactionFormProps): React.ReactElement {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData, unknown, TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultValues?.type ?? 'expense',
      amount: defaultValues?.amount ?? undefined,
      category: defaultValues?.category ?? '',
      note: defaultValues?.note ?? '',
      date: defaultValues?.date ?? new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');
  const selectedCategory = watch('category');

  const handleTypeToggle = (type: TransactionType): void => {
    setValue('type', type);
    // Reset category when type changes
    setValue('category', '');
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Type Toggle */}
      <View className="mb-6 flex-row overflow-hidden rounded-xl bg-gray-900">
        <Pressable
          onPress={() => handleTypeToggle('expense')}
          className={`flex-1 items-center py-3 ${
            selectedType === 'expense' ? 'bg-red-500' : 'active:bg-gray-800'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              selectedType === 'expense' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Expense
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleTypeToggle('income')}
          className={`flex-1 items-center py-3 ${
            selectedType === 'income' ? 'bg-green-500' : 'active:bg-gray-800'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              selectedType === 'income' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Income
          </Text>
        </Pressable>
      </View>

      {/* Amount */}
      <View className="mb-6">
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value !== undefined ? String(value) : ''}
              onBlur={onBlur}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                const num = parseFloat(cleaned);
                onChange(isNaN(num) ? undefined : num);
              }}
              error={errors.amount?.message}
            />
          )}
        />
      </View>

      {/* Date */}
      <View className="mb-6">
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DatePicker
              label="Date"
              value={value}
              onChange={onChange}
              error={errors.date?.message}
            />
          )}
        />
      </View>

      {/* Category */}
      <View className="mb-6">
        <Text className="mb-3 text-sm font-medium text-gray-300">Category</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange } }) => (
            <CategorySelector
              type={selectedType}
              selected={selectedCategory}
              onSelect={(key) => onChange(key)}
            />
          )}
        />
        {errors.category && (
          <Text className="mt-2 text-xs text-red-400">
            {errors.category.message}
          </Text>
        )}
      </View>

      {/* Note */}
      <View className="mb-8">
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Note (optional)"
              placeholder="Add a note..."
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              maxLength={MAX_NOTE_LENGTH}
              error={errors.note?.message}
              helperText={`${value?.length ?? 0}/${MAX_NOTE_LENGTH}`}
            />
          )}
        />
      </View>

      {/* Submit */}
      <Button
        title={submitLabel}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        size="lg"
        fullWidth
      />
    </ScrollView>
  );
}

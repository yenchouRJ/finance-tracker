import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Button, Input } from '@/components/ui';
import { CategorySelector } from '@/components/shared/category-selector';
import {
  transactionSchema,
  type TransactionFormData,
} from '@/validators/transaction';
import { formatDate } from '@/lib/date';
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
  const selectedDate = watch('date');
  const [showDateInput, setShowDateInput] = useState(false);

  const handleTypeToggle = (type: TransactionType): void => {
    setValue('type', type);
    // Reset category when type changes
    setValue('category', '');
  };

  const handleDateChange = (dateString: string): void => {
    // Validate basic date format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      setValue('date', dateString);
    }
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
        <Text className="mb-1.5 text-sm font-medium text-gray-300">Date</Text>
        <Pressable
          onPress={() => setShowDateInput(!showDateInput)}
          className="flex-row items-center rounded-lg border border-gray-700 bg-gray-900 px-4 py-3"
        >
          <MaterialCommunityIcons name="calendar" size={20} color="#9ca3af" />
          <Text className="ml-3 flex-1 text-base text-white">
            {selectedDate
              ? formatDate(new Date(selectedDate + 'T00:00:00'))
              : 'Select date'}
          </Text>
          <MaterialCommunityIcons
            name={showDateInput ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#9ca3af"
          />
        </Pressable>
        {showDateInput && (
          <View className="mt-2">
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    handleDateChange(text);
                  }}
                  error={errors.date?.message}
                  helperText="Format: YYYY-MM-DD (e.g. 2026-03-24)"
                />
              )}
            />
          </View>
        )}
        {errors.date && !showDateInput && (
          <Text className="mt-1 text-xs text-red-400">{errors.date.message}</Text>
        )}
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

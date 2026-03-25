import { z } from 'zod';

import { ALL_CATEGORIES } from '@/lib/categories';
import { MAX_NOTE_LENGTH, MAX_AMOUNT } from '@/lib/constants';

const categoryKeys = ALL_CATEGORIES.map((c) => c.key);

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .max(MAX_AMOUNT, `Amount cannot exceed ${MAX_AMOUNT.toLocaleString()}`),
  category: z
    .string({ message: 'Category is required' })
    .refine((val) => categoryKeys.includes(val), {
      message: 'Please select a valid category',
    }),
  note: z
    .string()
    .max(MAX_NOTE_LENGTH, `Note cannot exceed ${MAX_NOTE_LENGTH} characters`),
  date: z.string({ message: 'Date is required' }).min(1, 'Date is required'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

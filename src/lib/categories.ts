import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Category = {
  key: string;
  label: string;
  icon: IconName;
  type: 'expense' | 'income' | 'both';
};

export const EXPENSE_CATEGORIES: Category[] = [
  { key: 'food', label: 'Food', icon: 'food', type: 'expense' },
  { key: 'transportation', label: 'Transport', icon: 'bus', type: 'expense' },
  { key: 'entertainment', label: 'Entertainment', icon: 'gamepad-variant', type: 'expense' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping', type: 'expense' },
  { key: 'health', label: 'Health', icon: 'hospital-box', type: 'expense' },
  { key: 'education', label: 'Education', icon: 'school', type: 'expense' },
  { key: 'housing', label: 'Housing', icon: 'home-city', type: 'expense' },
  { key: 'bills', label: 'Bills', icon: 'file-document', type: 'expense' },
  { key: 'clothing', label: 'Clothing', icon: 'tshirt-crew', type: 'expense' },
  { key: 'personal', label: 'Personal', icon: 'account', type: 'expense' },
  { key: 'gifts', label: 'Gifts', icon: 'gift', type: 'expense' },
  { key: 'other_expense', label: 'Other', icon: 'dots-horizontal', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { key: 'salary', label: 'Salary', icon: 'cash', type: 'income' },
  { key: 'freelance', label: 'Freelance', icon: 'laptop', type: 'income' },
  { key: 'investment', label: 'Investment', icon: 'chart-line', type: 'income' },
  { key: 'bonus', label: 'Bonus', icon: 'star', type: 'income' },
  { key: 'gift_income', label: 'Gift', icon: 'gift', type: 'income' },
  { key: 'refund', label: 'Refund', icon: 'cash-refund', type: 'income' },
  { key: 'other_income', label: 'Other', icon: 'dots-horizontal', type: 'income' },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryByKey(key: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.key === key);
}

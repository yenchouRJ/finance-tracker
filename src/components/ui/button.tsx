import { Pressable, type PressableProps, ActivityIndicator } from 'react-native';
import { Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 active:bg-blue-600',
  secondary: 'bg-gray-700 active:bg-gray-600',
  outline: 'border border-gray-600 bg-transparent active:bg-gray-800',
  ghost: 'bg-transparent active:bg-gray-800',
  danger: 'bg-red-500 active:bg-red-600',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-gray-200',
  ghost: 'text-gray-200',
  danger: 'text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 rounded-md',
  md: 'px-4 py-2.5 rounded-lg',
  lg: 'px-6 py-3.5 rounded-xl',
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-xs font-medium',
  md: 'text-sm font-semibold',
  lg: 'text-base font-semibold',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`
        items-center justify-center flex-row
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className={`${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>{title}</Text>
      )}
    </Pressable>
  );
}

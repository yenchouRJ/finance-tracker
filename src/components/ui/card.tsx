import { View, type ViewProps } from 'react-native';

type CardProps = ViewProps & {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const variantClasses: Record<string, string> = {
  default: 'bg-gray-900 rounded-xl',
  elevated: 'bg-gray-900 rounded-xl shadow-lg',
  outlined: 'bg-transparent border border-gray-800 rounded-xl',
};

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps): React.ReactElement {
  return (
    <View
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

import { TextInput, View, Text, type TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps): React.ReactElement {
  const borderColor = error ? 'border-red-500' : 'border-gray-700 focus:border-blue-500';

  return (
    <View className="w-full">
      {label && <Text className="mb-1.5 text-sm font-medium text-gray-300">{label}</Text>}
      <TextInput
        className={`
          w-full rounded-lg border px-4 py-3
          bg-gray-900 text-white text-base
          placeholder:text-gray-500
          ${borderColor}
          ${className}
        `}
        placeholderTextColor="#6b7280"
        {...props}
      />
      {error ? <Text className="mt-1 text-xs text-red-400">{error}</Text> : null}
      {helperText && !error ? (
        <Text className="mt-1 text-xs text-gray-500">{helperText}</Text>
      ) : null}
    </View>
  );
}

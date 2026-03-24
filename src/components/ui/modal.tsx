import { Modal as RNModal, View, Pressable, type ModalProps as RNModalProps } from 'react-native';

type ModalProps = RNModalProps & {
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({
  visible,
  onClose,
  children,
  ...props
}: ModalProps): React.ReactElement {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-2xl bg-gray-900 px-4 pb-8 pt-4">
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-600" />
          {children}
        </View>
      </View>
    </RNModal>
  );
}

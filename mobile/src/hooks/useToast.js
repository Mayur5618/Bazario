import { Alert } from 'react-native';

export const useToast = () => {
  const showToast = (message, type = 'success') => {
    Alert.alert(
      type === 'success' ? 'Success' : 'Error',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  return { showToast };
}; 
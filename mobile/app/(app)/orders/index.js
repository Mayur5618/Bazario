import { Stack } from 'expo-router';
import OrderHistoryScreen from '../../../src/screens/OrderHistoryScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Order History',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <OrderHistoryScreen />
    </>
  );
} 
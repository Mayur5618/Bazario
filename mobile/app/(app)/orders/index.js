import React from 'react';
import { Stack } from 'expo-router';
import OrderHistoryScreen from '../../../src/screens/OrderHistoryScreen';
import { useAuth } from '../../../src/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function OrdersScreen() {
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
          title: 'My Orders',
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
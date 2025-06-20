import { Stack } from 'expo-router';
import OrderDetailScreen from '../../../src/screens/OrderDetailScreen';

export default function OrderDetail() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Order Details',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <OrderDetailScreen />
    </>
  );
} 
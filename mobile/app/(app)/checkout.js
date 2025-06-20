import { Stack } from 'expo-router';
import CheckoutScreen from '../../src/screens/CheckoutScreen';

export default function Checkout() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Checkout',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right'
        }} 
      />
      <CheckoutScreen />
    </>
  );
} 
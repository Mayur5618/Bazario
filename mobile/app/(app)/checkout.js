import { Stack } from 'expo-router';
import CheckoutScreen from '../../src/screens/CheckoutScreen';

export default function Checkout() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }} 
      />
      <CheckoutScreen />
    </>
  );
} 
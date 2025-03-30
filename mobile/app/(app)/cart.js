import CartScreen from '../../src/screens/CartScreen';
import { Stack } from 'expo-router';

export default function Cart() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <CartScreen />
    </>
  );
} 
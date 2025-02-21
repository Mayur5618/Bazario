import { Stack } from 'expo-router';
import ShippingAddressScreen from '../../../src/screens/account/ShippingAddressScreen';

export default function ShippingAddress() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Shipping Address',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <ShippingAddressScreen />
    </>
  );
} 
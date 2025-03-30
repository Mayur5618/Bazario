import { Stack } from 'expo-router';
import OrderSuccessScreen from '../../../src/screens/OrderSuccessScreen';

const OrderSuccess = () => {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      <OrderSuccessScreen />
    </>
  );
};

export default OrderSuccess; 
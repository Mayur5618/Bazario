// import B2BProductDetailScreen from '../../../../src/screens/B2BProductDetailScreen';
import { Stack } from 'expo-router';
import B2BProductDetailScreen from '../../../src/screens/B2BProductDetailScreen';

export default function ProductDetailPage() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <B2BProductDetailScreen />
    </>
  );
} 
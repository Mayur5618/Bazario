import { Stack } from 'expo-router';
import WishlistScreen from '../../../src/screens/account/WishlistScreen';

export default function Wishlist() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'My Wishlist',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <WishlistScreen />
    </>
  );
} 
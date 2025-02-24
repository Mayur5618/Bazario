import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WishlistProvider } from '../src/contexts/WishlistContext';
import Toast from 'react-native-toast-message';
import { ReviewProvider } from '../src/context/ReviewContext';

export default function RootLayout() {
  return (
    <RootSiblingParent>
      <Provider store={store}>
        <SafeAreaProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ReviewProvider>
                  <Stack 
                    screenOptions={{ 
                      headerShown: false,
                      animation: 'slide_from_right'
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(app)" />
                  </Stack>
                  <Toast />
                </ReviewProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Provider>
    </RootSiblingParent>
  );
} 
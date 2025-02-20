import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function RootLayout() {
  return (
    <RootSiblingParent>
      <Provider store={store}>
        <AuthProvider>
          <CartProvider>
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
          </CartProvider>
        </AuthProvider>
      </Provider>
    </RootSiblingParent>
  );
} 
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
import { LanguageProvider } from '../src/context/LanguageContext';

export default function RootLayout() {
  return (
    <RootSiblingParent>
      <Provider store={store}>
        <SafeAreaProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ReviewProvider>
                  <LanguageProvider>
                    <Stack 
                      screenOptions={{ 
                        headerShown: true,
                        animation: 'slide_from_right'
                      }}
                    >
                      <Stack.Screen 
                        name="index" 
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen 
                        name="(auth)" 
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen 
                        name="(app)" 
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen 
                        name="(seller)" 
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen 
                        name="(agency)" 
                        options={{
                          headerShown: false,
                        }}
                      />
                    </Stack>
                    <Toast />
                  </LanguageProvider>
                </ReviewProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Provider>
    </RootSiblingParent>
  );
} 
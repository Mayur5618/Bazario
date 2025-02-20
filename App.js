import { CartProvider } from './src/context/CartContext';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function App() {
  return (
    <RootSiblingParent>
    <AuthProvider>
      <CartProvider>
        <View style={{ flex: 1 }}>
          {/* Your app components */}
          <Toast />
        </View>
      </CartProvider>
    </AuthProvider>
    </RootSiblingParent>
  );
} 
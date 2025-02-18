import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Your app components */}
      </CartProvider>
    </AuthProvider>
  );
} 
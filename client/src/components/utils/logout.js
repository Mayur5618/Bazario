import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const useLogout = () => {
  const { logout: authLogout } = useAuth();
  const { clearCart } = useCart();

  const logout = () => {
    authLogout();
    clearCart();
  };

  return logout;
};
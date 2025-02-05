import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/home');
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }} 
    />
  );
} 
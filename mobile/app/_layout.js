import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, useSegments } from 'expo-router';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Hide splash screen after initial navigation
    SplashScreen.hideAsync();
    
    // Ensure we start at the root route
    router.replace('/(auth)/login');
  }, []);

  return (
    <AuthProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade'
        }} 
      />
    </AuthProvider>
  );
} 
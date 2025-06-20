import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false // This will hide the header for all screens in the auth stack
    }}>
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="language-selection"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="seller/login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="seller/register"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="agency/login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="agency/registration"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 
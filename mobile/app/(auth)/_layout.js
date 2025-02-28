import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
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
    </Stack>
  );
} 
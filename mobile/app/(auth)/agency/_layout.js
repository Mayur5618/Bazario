import { Stack } from 'expo-router';

export default function AgencyAuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="language-selection"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="registration"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 
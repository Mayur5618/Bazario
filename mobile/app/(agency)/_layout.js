import { Stack } from 'expo-router';

export default function AgencyLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="won-auctions"
        options={{
          headerShown: true,
          title: "Won Auctions"
        }}
      />
    </Stack>
  );
} 
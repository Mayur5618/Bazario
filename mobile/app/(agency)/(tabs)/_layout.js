import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="won-auctions"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
} 
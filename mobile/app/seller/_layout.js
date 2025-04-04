import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        header: () => null
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false,
          header: () => null
        }}
      />
      <Stack.Screen 
        name="b2b-products/[id]"
        options={{
          headerShown: false,
          header: () => null
        }}
      />
    </Stack>
  );
} 
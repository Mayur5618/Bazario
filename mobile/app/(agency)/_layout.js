import { Stack } from 'expo-router';

export default function AgencyLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="dashboard"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="product/[id]"
        options={{
          headerShown: true,
          headerTitle: "Product Details",
          headerTintColor: "#000",
          headerStyle: {
            backgroundColor: '#fff'
          }
        }}
      />
    </Stack>
  );
} 
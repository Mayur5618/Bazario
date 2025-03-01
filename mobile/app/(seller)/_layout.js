import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#6C63FF',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen 
        name="dashboard"
        options={{
          title: 'Seller Dashboard',
          headerLeft: null, // Disable back button
        }}
      />
      <Stack.Screen 
        name="add-product"
        options={{
          title: 'नया प्रोडक्ट जोड़ें',
        }}
      />
    </Stack>
  );
} 
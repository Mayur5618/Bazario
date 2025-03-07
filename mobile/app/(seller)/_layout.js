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
        name="products"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="product-details/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="add-product"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="view-orders"
        options={{
          title: "ऑर्डर्स",
          headerStyle: {
            backgroundColor: '#6B46C1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="order-details/[id]"
        options={{
          title: "ऑर्डर विवरण",
          headerStyle: {
            backgroundColor: '#6B46C1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="edit-product/[id]"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
} 
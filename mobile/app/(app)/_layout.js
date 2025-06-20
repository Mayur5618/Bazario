import { Stack, usePathname } from 'expo-router';
import BottomTabs from '../../src/components/BottomTabs';
import { View } from 'react-native';

export default function AppLayout() {
  const pathname = usePathname();
  const hideTabsOn = ['/checkout', '/product/[id]', '/account/add-address', '/account/shipping-addresses'];
  const shouldShowTabs = !hideTabsOn.some(path => pathname.includes(path));

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: true,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen 
          name="index"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="home" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="cart" 
         options={{
          headerShown: true
        }} />
        <Stack.Screen name="checkout" 
         options={{
          headerShown: false
        }}/>
        <Stack.Screen name="categories" 
         options={{
          headerShown: false
        }}/>
        <Stack.Screen 
          name="account" 
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="account/wishlist"
         options={{
          headerShown: false
        }} />
        <Stack.Screen name="search" 
         options={{
          headerShown: false
        }}/>
        <Stack.Screen name="settings" 
         options={{
          headerShown: false
        }}/>
        <Stack.Screen name="orders" 
         options={{
          headerShown: false
        }}/>
        <Stack.Screen 
          name="category/[id]"
          options={({ route }) => ({
            headerShown: true,
            title: route.params.id,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18
            },
            headerShadowVisible: true,
            headerStyle: {
              backgroundColor: '#fff'
            }
          })}
        />
        <Stack.Screen 
          name="product/[id]"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="product/edit-review"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="account/add-address"
          options={{
            title: 'Add New Address',
            headerTitleStyle: {
              fontWeight: '600',
            }
          }}
        />
        <Stack.Screen 
          name="account/shipping-addresses"
          options={{
            title: 'Shipping Addresses',
            headerTitleStyle: {
              fontWeight: '600',
            }
          }}
        />
        <Stack.Screen 
          name="seller/[id]"
          options={{
            headerShown: false
          }}
        />
      </Stack>
      {shouldShowTabs && <BottomTabs />}
    </View>
  );
} 
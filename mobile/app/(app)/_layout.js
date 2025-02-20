import { Stack } from 'expo-router';
import BottomTabs from '../../src/components/BottomTabs';
import { View } from 'react-native';

export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen 
          name="index"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="home" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="account" />
        <Stack.Screen name="search" />
        <Stack.Screen name="settings" />
        <Stack.Screen 
          name="product/[id]"
          options={{
            presentation: 'modal'
          }}
        />
      </Stack>
      <BottomTabs />
    </View>
  );
} 
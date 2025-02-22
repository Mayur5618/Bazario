import React from 'react';
import { View, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: `Order #${id}`,
          headerShown: true,
        }}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Order Detail Screen for order {id}</Text>
      </View>
    </>
  );
} 
import { Stack } from 'expo-router';
import BottomTabs from '../../src/components/BottomTabs';
import { View } from 'react-native';

export default function AppLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <BottomTabs />
    </View>
  );
} 
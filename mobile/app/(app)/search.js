// mobile/app/(app)/search.js
import { Stack } from 'expo-router';
import SearchScreen from '../../src/screens/SearchScreen';

export default function Search() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'modal'  // This makes it slide up from bottom
        }} 
      />
      <SearchScreen />
    </>
  );
}
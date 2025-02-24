import { Stack } from 'expo-router';
import EditReviewScreen from '../../../src/screens/EditReviewScreen';

export default function EditReview() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Review',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <EditReviewScreen />
    </>
  );
} 
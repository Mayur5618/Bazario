import { Stack } from 'expo-router';

export default function ViewOrdersLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "ऑर्डर्स",
                    headerStyle: {
                        backgroundColor: '#6B46C1',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShown: false,
                }}
            />
        </Stack>
    );
} 
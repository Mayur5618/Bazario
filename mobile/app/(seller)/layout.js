import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function Layout() {
    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" backgroundColor="#6B46C1" />
            <Stack 
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: {
                        backgroundColor: '#F7FAFC'
                    }
                }}
            />
        </View>
    );
} 
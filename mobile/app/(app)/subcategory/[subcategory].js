import { Stack } from 'expo-router';
import SubcategoryScreen from '../../../src/screens/SubcategoryScreen';

export default function SubcategoryRoute() {
    return (
        <>
            <Stack.Screen 
                options={{
                    headerShown: false
                }}
            />
            <SubcategoryScreen />
        </>
    );
} 
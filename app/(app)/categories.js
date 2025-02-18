import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated,
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from '../config/axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const scrollY = new Animated.Value(0);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/products/categories', {
                params: { platformType: 'b2c' }
            });
            if (response.data.success) {
                const categoriesWithMeta = response.data.categories.map((cat, index) => ({
                    name: cat,
                    icon: getCategoryIcon(cat),
                    color: getCategoryColor(index),
                    gradient: getCategoryGradient(index)
                }));
                setCategories(categoriesWithMeta);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Fresh Vegetables': 'leaf-outline',
            'Home-Cooked Meals': 'restaurant-outline',
            'Traditional Pickles': 'nutrition-outline',
            'Seasonal Specials': 'star-outline',
            'default': 'grid-outline'
        };
        return icons[category] || icons.default;
    };

    const getCategoryColor = (index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        return colors[index % colors.length];
    };

    const getCategoryGradient = (index) => {
        const gradients = [
            ['#FF6B6B', '#FFE66D'],
            ['#4ECDC4', '#556270'],
            ['#45B7D1', '#2E8BC0'],
            ['#96CEB4', '#FFEEAD']
        ];
        return gradients[index % gradients.length];
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4169E1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Categories</Text>
            </View>

            {/* Categories Grid */}
            <Animated.FlatList
                data={categories}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContainer}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                renderItem={({ item, index }) => {
                    const scale = scrollY.interpolate({
                        inputRange: [-1, 0, 100 * index, 100 * (index + 2)],
                        outputRange: [1, 1, 1, 0.9]
                    });

                    return (
                        <Animated.View style={[
                            styles.categoryCard,
                            { transform: [{ scale }] }
                        ]}>
                            <TouchableOpacity
                                onPress={() => router.push(`/(app)/category/${item.name}`)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={item.gradient}
                                    style={styles.gradientCard}
                                >
                                    <Ionicons name={item.icon} size={40} color="#FFF" />
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }}
                keyExtractor={item => item.name}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    gridContainer: {
        padding: 8,
    },
    categoryCard: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        maxWidth: (width - 48) / 2, // 2 columns with padding
    },
    gradientCard: {
        padding: 16,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
}); 
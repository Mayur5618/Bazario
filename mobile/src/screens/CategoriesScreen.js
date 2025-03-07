import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 180;

const CategoriesScreen = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: 'Home-Cooked Food',
            icon: '🍱',
            color: ['#FF6B6B', '#FF9B9B'],
            description: 'Authentic homemade dishes prepared with love',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 2, 
            name: 'Seasonal Foods',
            icon: '🍂',
            color: ['#76BA99', '#94B49F'],
            description: 'Fresh and seasonal specialties',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 3,
            name: 'Traditional Pickles',
            icon: '🥫',
            color: ['#F9975D', '#FCB677'],
            description: 'Handcrafted traditional pickles and preserves',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 4,
            name: 'Vegetables',
            icon: '🥬',
            color: ['#7BC4AA', '#98D8AA'],
            description: 'Fresh farm vegetables and greens',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    ]);

    const [selectedId, setSelectedId] = useState(null);
    const scaleAnimation = new Animated.Value(1);
    const [loading, setLoading] = useState(false);

    const handleCategoryPress = async (category) => {
        setSelectedId(category.id);
        
        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnimation, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        try {
            // Show loading state
            setLoading(true);

            // Fetch products for the selected category
            const response = await axios.get(`http://192.168.1.100:8000/api/products?category=${encodeURIComponent(category.name)}`);
            
            if (response.data && response.data.products) {
                // Navigate to products screen with category data
                navigation.navigate('Products', {
                    category: category.name,
                    products: response.data.products,
                    categoryColor: category.color[0]
                });
            } else {
                console.error('Invalid response format:', response.data);
                Alert.alert('Error', 'No products found in this category');
            }
        } catch (error) {
            console.error('Error fetching category products:', error.response || error);
            Alert.alert(
                'Error',
                'Failed to load products. Please check your internet connection and try again.'
            );
        } finally {
            setLoading(false);
            setSelectedId(null);
        }
    };

    const CategoryCard = ({ category }) => {
        const isSelected = selectedId === category.id;
        
        return (
            <Animated.View
                style={[
                    styles.categoryCardContainer,
                    { transform: [{ scale: isSelected ? scaleAnimation : 1 }] }
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleCategoryPress(category)}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={category.color}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryCard}
                    >
                        <View style={styles.categoryContent}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                            </View>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryDescription}>
                                {category.description}
                            </Text>
                            <View style={styles.arrowContainer}>
                                {loading && selectedId === category.id ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <MaterialIcons 
                                        name="arrow-forward" 
                                        size={24} 
                                        color="#fff"
                                    />
                                )}
                            </View>
                        </View>
                        <Image 
                            source={{ uri: category.image }}
                            style={styles.categoryImage}
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>Categories</Text>
            <Text style={styles.subHeader}>Explore our curated collection</Text>

            <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
        letterSpacing: 0.5,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        letterSpacing: 0.5,
    },
    categoriesGrid: {
        flexDirection: 'column',
        gap: 16,
        paddingBottom: 16,
    },
    categoryCardContainer: {
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    categoryCard: {
        borderRadius: 16,
        height: CARD_HEIGHT,
        overflow: 'hidden',
        position: 'relative',
    },
    categoryContent: {
        flex: 1,
        padding: 20,
        zIndex: 2,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryIcon: {
        fontSize: 28,
    },
    categoryName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        width: '60%',
        lineHeight: 20,
    },
    categoryImage: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        width: width * 0.5,
        height: CARD_HEIGHT * 1.2,
        opacity: 0.15,
    },
    arrowContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategoriesScreen; 
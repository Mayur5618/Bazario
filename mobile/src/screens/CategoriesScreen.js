import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    Image,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CategoriesScreen = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: 'Home-Cooked Food',
            icon: '🍱',
            color: '#FF9B9B',
            description: 'Authentic homemade dishes prepared with love',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 2, 
            name: 'Seasonal Foods',
            icon: '🍂',
            color: '#94B49F',
            description: 'Fresh and seasonal specialties',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 3,
            name: 'Traditional Pickles',
            icon: '🥫',
            color: '#FCB677',
            description: 'Handcrafted traditional pickles and preserves',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            id: 4,
            name: 'Vegetables',
            icon: '🥬',
            color: '#98D8AA',
            description: 'Fresh farm vegetables and greens',
            image: "https://images.unsplash.com/photo-1504674900053-d7d9766dd003?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    ]);

    const handleCategoryPress = async (category) => {
        try {
            // Use your search API with category filter
            const response = await axios.get(`/api/search?category=${category.name}`);
            
            navigation.navigate('ProductList', {
                category: category.name,
                products: response.data.products
            });
        } catch (error) {
            console.error('Error fetching category products:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Categories</Text>
            <Text style={styles.subHeader}>Explore our curated collection</Text>

            <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.categoryCard, { backgroundColor: category.color }]}
                        onPress={() => handleCategoryPress(category)}
                    >
                        <View style={styles.categoryContent}>
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryDescription}>
                                {category.description}
                            </Text>
                            <MaterialIcons 
                                name="arrow-forward" 
                                size={24} 
                                color="#fff" 
                                style={styles.arrow}
                            />
                        </View>
                        <Image 
                            source={category.image}
                            style={styles.categoryImage}
                        />
                    </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    categoriesGrid: {
        flexDirection: 'column',
        gap: 16,
    },
    categoryCard: {
        borderRadius: 16,
        padding: 20,
        height: 200,
        overflow: 'hidden',
        position: 'relative',
    },
    categoryContent: {
        flex: 1,
        zIndex: 2,
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    categoryDescription: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        width: '60%',
    },
    categoryImage: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: width * 0.4,
        height: '100%',
        opacity: 0.2,
    },
    arrow: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    }
});

export default CategoriesScreen; 
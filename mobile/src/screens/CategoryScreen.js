import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Image,
    RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '../config/axios';
import * as Animatable from 'react-native-animatable';
import { Rating } from 'react-native-ratings';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const CategoryScreen = () => {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryData, setCategoryData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [buyerCity, setBuyerCity] = useState('');
    const router = useRouter();
    
    // Fetch buyer's city when component mounts
    useEffect(() => {
        fetchBuyerCity();
    }, []);

    // Fetch products when category or city changes
    useEffect(() => {
        if (id && buyerCity) {
            fetchCategoryProducts();
        }
    }, [id, buyerCity]);

    const fetchBuyerCity = async () => {
        try {
            const response = await axios.get('/api/buyer/city');
            if (response.data.success) {
                setBuyerCity(response.data.city);
            }
        } catch (err) {
            console.error('Error fetching buyer city:', err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch your city. Some products might not be visible.'
            });
        }
    };

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const apiUrl = `/api/products/category/${encodeURIComponent(id)}?city=${encodeURIComponent(buyerCity)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data.success) {
                setCategoryData(response.data);
                
                if (!response.data.totalProducts) {
                    Toast.show({
                        type: 'info',
                        text1: 'No products found',
                        text2: `No products available in ${buyerCity} for this category`
                    });
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch products');
            }
        } catch (err) {
            console.error('Error fetching category products:', err);
            setError('Failed to load products');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.response?.data?.message || 'Failed to load products'
            });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCategoryProducts();
        setRefreshing(false);
    };

    const navigateToProduct = (productId) => {
        router.push(`/product/${productId}`);
    };

    const renderProduct = (product) => (
        <TouchableOpacity
            key={product._id}
            style={styles.productCard}
            onPress={() => navigateToProduct(product._id)}
        >
            <Image
                source={{ uri: product.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                </Text>
                <View style={styles.ratingContainer}>
                    <Rating
                        readonly
                        startingValue={product.rating || 0}
                        imageSize={14}
                        style={{ marginRight: 5 }}
                    />
                    <Text style={styles.reviewCount}>
                        ({product.numReviews || 0})
                    </Text>
                </View>
                <Text style={styles.price}>
                    ₹{(product.price || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.unit}>
                    per {product.unitSize} {product.unitType}
                </Text>
                {product.stock === 0 && (
                    <Text style={styles.outOfStock}>Out of Stock</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0066FF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchCategoryProducts}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            {categoryData?.subcategories?.length > 0 ? (
                categoryData.subcategories.map((subcategory, index) => (
                    <Animatable.View
                        key={subcategory.subcategory}
                        animation="fadeInUp"
                        delay={index * 100}
                        style={styles.subcategoryContainer}
                    >
                        <View style={styles.subcategoryHeader}>
                            <Text style={styles.subcategoryTitle}>
                                {subcategory.subcategory}
                            </Text>
                            <TouchableOpacity 
                                style={styles.viewAllButton}
                                onPress={() => router.push(`/(app)/subcategory/${encodeURIComponent(subcategory.subcategory)}?category=${encodeURIComponent(id)}`)}
                            >
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.productsGrid}>
                            {subcategory.products.slice(0, 4).map(renderProduct)}
                        </View>
                    </Animatable.View>
                ))
            ) : (
                <View style={styles.noProductsContainer}>
                    <Text style={styles.noProductsText}>
                        No products available in this category
                        {buyerCity ? ` for ${buyerCity}` : ''}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    subcategoryContainer: {
        marginBottom: 20,
        paddingTop: 15,
    },
    subcategoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    subcategoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#444',
    },
    viewAllButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 15,
        backgroundColor: '#f5f5f5',
    },
    viewAllText: {
        fontSize: 12,
        color: '#0066FF',
        fontWeight: '500',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    productCard: {
        width: width * 0.44,
        marginHorizontal: 5,
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: width * 0.44,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    productInfo: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        color: '#333',
        height: 40,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    reviewCount: {
        fontSize: 12,
        color: '#666',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0066FF',
        marginBottom: 2,
    },
    unit: {
        fontSize: 12,
        color: '#666',
    },
    outOfStock: {
        fontSize: 12,
        color: '#FF0000',
        fontWeight: '500',
        marginTop: 2,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    noProductsContainer: {
        padding: 30,
        alignItems: 'center',
    },
    noProductsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default CategoryScreen; 
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
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
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = width * 0.44;

const SubcategoryScreen = () => {
    const { subcategory, category } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [buyerCity, setBuyerCity] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const router = useRouter();

    // Fetch buyer's city when component mounts
    useEffect(() => {
        fetchBuyerCity();
    }, []);

    // Fetch products when category, subcategory or city changes
    useEffect(() => {
        if (category && subcategory && buyerCity) {
            fetchProducts();
        }
    }, [category, subcategory, buyerCity]);

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

    const fetchProducts = async (pageNum = 1, shouldRefresh = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            }
            setError(null);

            const response = await axios.get(
                `/api/products/category/${encodeURIComponent(category)}/subcategory/${encodeURIComponent(subcategory)}`,
                {
                    params: {
                        city: buyerCity,
                        page: pageNum,
                        limit: 10,
                        sortBy: 'createdAt',
                        order: 'desc'
                    }
                }
            );

            if (response.data.success) {
                if (shouldRefresh || pageNum === 1) {
                    setProducts(response.data.products);
                } else {
                    setProducts(prev => [...prev, ...response.data.products]);
                }
                setTotalPages(response.data.totalPages);
                setPage(pageNum);

                if (response.data.products.length === 0) {
                    Toast.show({
                        type: 'info',
                        text1: 'No products found',
                        text2: `No products available in ${buyerCity} for this subcategory`
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching subcategory products:', err);
            setError('Failed to load products');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.response?.data?.message || 'Failed to load products'
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProducts(1, true);
        setRefreshing(false);
    };

    const loadMoreProducts = () => {
        if (!loadingMore && page < totalPages) {
            setLoadingMore(true);
            fetchProducts(page + 1);
        }
    };

    const navigateToProduct = (productId) => {
        router.push(`/product/${productId}`);
    };

    const renderProduct = ({ item }) => (
        <Animatable.View
            animation="fadeIn"
            duration={500}
            style={styles.productCard}
        >
            <TouchableOpacity
                onPress={() => navigateToProduct(item._id)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Rating
                            readonly
                            startingValue={item.rating || 0}
                            imageSize={14}
                            style={{ marginRight: 5 }}
                        />
                        <Text style={styles.reviewCount}>
                            ({item.numReviews || 0})
                        </Text>
                    </View>
                    <Text style={styles.price}>
                        ₹{(item.price || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.unit}>
                        per {item.unitSize} {item.unitType}
                    </Text>
                    {item.stock === 0 && (
                        <Text style={styles.outOfStock}>Out of Stock</Text>
                    )}
                </View>
            </TouchableOpacity>
        </Animatable.View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#0066FF" />
            </View>
        );
    };

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
                    onPress={() => fetchProducts(1)}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{decodeURIComponent(subcategory)}</Text>
                <View style={styles.placeholder} />
            </View>

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={item => item._id}
                numColumns={2}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                onEndReached={loadMoreProducts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No products available in this subcategory
                            {buyerCity ? ` for ${buyerCity}` : ''}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 34, // Same as back button width
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    productList: {
        padding: 10,
    },
    productCard: {
        width: PRODUCT_WIDTH,
        margin: 8,
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
        height: PRODUCT_WIDTH,
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
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default SubcategoryScreen; 
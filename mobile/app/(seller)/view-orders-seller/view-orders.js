import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { sellerApi } from '../../../src/api/sellerApi';
import Toast from 'react-native-root-toast';

const ViewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { authState } = useAuth();
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await sellerApi.getSellerOrders();
            if (response.success) {
                const sortedOrders = response.orders.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
            } else {
                Toast.show('ऑर्डर लोड करने में समस्या आई है', {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                    shadow: true,
                    animation: true,
                });
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            Toast.show('ऑर्डर लोड करने में समस्या आई है', {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
                shadow: true,
                animation: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#FFA500'; // Orange
            case 'confirmed':
                return '#4169E1'; // Royal Blue
            case 'processing':
                return '#9370DB'; // Medium Purple
            case 'shipped':
                return '#20B2AA'; // Light Sea Green
            case 'delivered':
                return '#32CD32'; // Lime Green
            case 'cancelled':
                return '#DC143C'; // Crimson
            default:
                return '#808080'; // Gray
        }
    };

    const getStatusText = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'लंबित';
            case 'confirmed':
                return 'पुष्टि की गई';
            case 'processing':
                return 'प्रोसेसिंग';
            case 'shipped':
                return 'शिप किया गया';
            case 'delivered':
                return 'डिलीवर किया गया';
            case 'cancelled':
                return 'रद्द किया गया';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                </Text>
            </View>

            {/* Product Image and Info Row */}
            <View style={styles.productRow}>
                {/* Product Image */}
                {item.items && item.items[0]?.product?.images && item.items[0].product.images.length > 0 ? (
                    <Image 
                        source={{ uri: item.items[0].product.images[0] }}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={[styles.productImage, styles.noImage]}>
                        <Ionicons name="image-outline" size={30} color="#CBD5E0" />
                    </View>
                )}

                {/* Product Name and Quantity */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                        {item.items[0]?.product?.name || 'प्रोडक्ट का नाम'}
                    </Text>
                    <Text style={styles.quantityText}>
                        मात्रा: {item.items[0]?.quantity || 0} पीस
                    </Text>
                    <Text style={styles.priceText}>
                        ₹{item.items[0]?.price || 0} प्रति पीस
                    </Text>
                </View>
            </View>

            {/* Order Info */}
            <View style={styles.orderInfo}>
                <View style={styles.orderRow}>
                    <Ionicons name="receipt-outline" size={20} color="#4A5568" />
                    <Text style={styles.orderLabel}>ऑर्डर नंबर:</Text>
                    <Text style={styles.orderValue}>{item.orderId}</Text>
                </View>

                <View style={styles.orderRow}>
                    <Ionicons name="calendar-outline" size={20} color="#4A5568" />
                    <Text style={styles.orderLabel}>दिनांक:</Text>
                    <Text style={styles.orderValue}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.orderRow}>
                    <Ionicons name="person-outline" size={20} color="#4A5568" />
                    <Text style={styles.orderLabel}>ग्राहक:</Text>
                    <Text style={styles.orderValue}>{item.buyer?.firstname} {item.buyer?.lastname}</Text>
                </View>

                <View style={styles.orderRow}>
                    <Ionicons name="wallet-outline" size={20} color="#4A5568" />
                    <Text style={styles.orderLabel}>कुल राशि:</Text>
                    <Text style={styles.totalValue}>₹{item.total}</Text>
                </View>

                {/* Payment Status */}
                <View style={[styles.paymentBadge, { 
                    backgroundColor: item.payment?.status === 'paid' ? '#48BB7820' : '#FFA50020' 
                }]}>
                    <Ionicons 
                        name={item.payment?.status === 'paid' ? "checkmark-circle" : "time"} 
                        size={20} 
                        color={item.payment?.status === 'paid' ? '#48BB78' : '#FFA500'} 
                    />
                    <Text style={[styles.paymentText, { 
                        color: item.payment?.status === 'paid' ? '#48BB78' : '#FFA500' 
                    }]}>
                        {item.payment?.status === 'paid' ? 'भुगतान प्राप्त' : 'भुगतान बाकी'}
                    </Text>
                </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => router.push(`/(seller)/order-details/${item._id}`)}
            >
                <Text style={styles.viewDetailsText}>पूरी जानकारी देखें</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6B46C1" />
                <Text style={styles.loadingText}>ऑर्डर लोड हो रहे हैं...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {orders.length === 0 ? (
                <View style={styles.noOrders}>
                    <Ionicons name="cart-outline" size={64} color="#A0AEC0" />
                    <Text style={styles.noOrdersText}>कोई ऑर्डर नहीं मिला</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#6B46C1']}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        padding: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    orderInfo: {
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    orderLabel: {
        fontSize: 16,
        color: '#4A5568',
        marginLeft: 8,
        marginRight: 8,
        minWidth: 100,
    },
    orderValue: {
        fontSize: 16,
        color: '#2D3748',
        fontWeight: '500',
        flex: 1,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#48BB78',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    paymentText: {
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '500',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6B46C1',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 8,
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4A5568',
    },
    noOrders: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    noOrdersText: {
        fontSize: 18,
        color: '#718096',
        marginTop: 16,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    noImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
    },
    productInfo: {
        marginLeft: 12,
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    quantityText: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 2,
    },
    priceText: {
        fontSize: 14,
        color: '#4A5568',
    },
});

export default ViewOrders; 
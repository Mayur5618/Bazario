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

            {/* Order Basic Info */}
            <View style={styles.basicInfo}>
                <Text style={styles.orderIdText}>ऑर्डर नंबर: {item.orderId}</Text>
                <Text style={styles.dateText}>
                    <Ionicons name="calendar-outline" size={16} color="#718096" />
                    {" "}ऑर्डर की तारीख: {formatDate(item.createdAt)}
                </Text>
            </View>

            {/* Customer Info Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person" size={20} color="#4A5568" />
                    <Text style={styles.sectionTitle}>ग्राहक की जानकारी</Text>
                </View>
                <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>
                        नाम: {item.buyer?.firstname} {item.buyer?.lastname}
                    </Text>
                    {item.buyer?.phone && (
                        <TouchableOpacity style={styles.phoneButton}>
                            <Ionicons name="call" size={16} color="#48BB78" />
                            <Text style={styles.phoneText}>{item.buyer.phone}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {item.shippingAddress && (
                    <View style={styles.addressBox}>
                        <Ionicons name="location" size={16} color="#4A5568" />
                        <Text style={styles.addressText}>
                            पता: {[
                                item.shippingAddress.street,
                                item.shippingAddress.city,
                                item.shippingAddress.state,
                                item.shippingAddress.pincode
                            ].filter(Boolean).join(', ')}
                        </Text>
                    </View>
                )}
            </View>

            {/* Products Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="cart" size={20} color="#4A5568" />
                    <Text style={styles.sectionTitle}>ऑर्डर किए गए प्रोडक्ट</Text>
                </View>
                {item.items && item.items.map((orderItem, index) => (
                    <View key={index} style={styles.productItem}>
                        <View style={styles.productInfo}>
                            {orderItem.image && (
                                <Image 
                                    source={{ uri: orderItem.image }} 
                                    style={styles.productImage}
                                />
                            )}
                            <View style={styles.productDetails}>
                                <Text style={styles.productName}>
                                    {orderItem.productName || 'प्रोडक्ट का नाम'}
                                </Text>
                                <Text style={styles.productQuantity}>
                                    मात्रा: {orderItem.quantity || 1} पीस
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.productPrice}>₹{orderItem.price || 0}</Text>
                    </View>
                ))}
            </View>

            {/* Payment Info */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="wallet" size={20} color="#4A5568" />
                    <Text style={styles.sectionTitle}>पेमेंट की जानकारी</Text>
                </View>
                <View style={styles.paymentDetails}>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>प्रोडक्ट का मूल्य:</Text>
                        <Text style={styles.paymentValue}>₹{item.subtotal}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>डिलीवरी चार्ज:</Text>
                        <Text style={styles.paymentValue}>₹{item.shippingCost}</Text>
                    </View>
                    <View style={[styles.paymentRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>कुल राशि:</Text>
                        <Text style={styles.totalValue}>₹{item.total}</Text>
                    </View>
                </View>
            </View>

            {/* Review Section */}
            {item.review && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="star" size={20} color="#F6E05E" />
                        <Text style={styles.sectionTitle}>ग्राहक की राय</Text>
                    </View>
                    <View style={styles.reviewBox}>
                        <View style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FontAwesome
                                    key={star}
                                    name={star <= (item.review.rating || 0) ? "star" : "star-o"}
                                    size={16}
                                    color="#F6E05E"
                                    style={styles.starIcon}
                                />
                            ))}
                        </View>
                        <Text style={styles.reviewText}>{item.review.comment || 'कोई टिप्पणी नहीं'}</Text>
                    </View>
                </View>
            )}

            {/* Action Button */}
            <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push(`/(seller)/order-details/${item._id}`)}
            >
                <Text style={styles.actionButtonText}>पूरी जानकारी देखें</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
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
            <Text style={styles.header}>मेरे ऑर्डर</Text>
            {orders.length === 0 ? (
                <View style={styles.noOrders}>
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 16,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
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
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginLeft: 8,
    },
    customerInfo: {
        marginBottom: 8,
    },
    customerName: {
        fontSize: 16,
        color: '#2D3748',
        marginBottom: 4,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#48BB7820',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    phoneText: {
        color: '#48BB78',
        marginLeft: 4,
        fontSize: 14,
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#EDF2F7',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    addressText: {
        flex: 1,
        marginLeft: 8,
        color: '#4A5568',
        fontSize: 14,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        color: '#2D3748',
        fontWeight: '500',
    },
    productQuantity: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3748',
    },
    paymentDetails: {
        backgroundColor: '#EDF2F7',
        padding: 12,
        borderRadius: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#718096',
    },
    paymentValue: {
        fontSize: 14,
        color: '#2D3748',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#CBD5E0',
        paddingTop: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    reviewBox: {
        backgroundColor: '#FFFFF0',
        padding: 12,
        borderRadius: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    starIcon: {
        marginRight: 4,
    },
    reviewText: {
        fontSize: 14,
        color: '#4A5568',
        fontStyle: 'italic',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6B46C1',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    basicInfo: {
        marginBottom: 16,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: '#718096',
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
    },
    noOrdersText: {
        fontSize: 16,
        color: '#718096',
    },
});

export default ViewOrders; 
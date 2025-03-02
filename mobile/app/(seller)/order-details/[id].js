import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { sellerApi } from '../../../src/api/sellerApi';
import Toast from 'react-native-root-toast';

const OrderDetails = () => {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customerHistory, setCustomerHistory] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await sellerApi.getOrderDetails(id);
            if (response.success) {
                setOrder(response.order);
                // Fetch customer history only if buyer exists
                if (response.order.buyer) {
                    try {
                        const historyResponse = await sellerApi.getCustomerOrderHistory(response.order.buyer);
                        if (historyResponse.success) {
                            setCustomerHistory(historyResponse);
                        }
                    } catch (historyError) {
                        console.log('Could not fetch customer history:', historyError);
                        // Don't show error toast for history fetch failure
                    }
                }
            } else {
                Toast.show('ऑर्डर की जानकारी लोड करने में समस्या आई है', {
                    duration: Toast.durations.LONG,
                });
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            Toast.show('कुछ गलत हो गया', {
                duration: Toast.durations.LONG,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#FFA500';
            case 'confirmed': return '#4169E1';
            case 'processing': return '#9370DB';
            case 'shipped': return '#20B2AA';
            case 'delivered': return '#32CD32';
            case 'cancelled': return '#DC143C';
            default: return '#808080';
        }
    };

    const getStatusText = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'लंबित';
            case 'confirmed': return 'पुष्टि की गई';
            case 'processing': return 'प्रोसेसिंग';
            case 'shipped': return 'शिप किया गया';
            case 'delivered': return 'डिलीवर किया गया';
            case 'cancelled': return 'रद्द किया गया';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'उपलब्ध नहीं';
        const date = new Date(dateString);
        return date.toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6B46C1" />
                <Text style={styles.loadingText}>जानकारी लोड हो रही है...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>ऑर्डर नहीं मिला</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#4A5568" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ऑर्डर की जानकारी</Text>
            </View>

            {/* Order Status */}
            <View style={styles.section}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        ऑर्डर स्थिति: {getStatusText(order.status)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ऑर्डर नंबर:</Text>
                    <Text style={styles.infoValue}>{order.orderId}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ऑर्डर की तारीख:</Text>
                    <Text style={styles.infoValue}>{formatDate(order.createdAt || order.orderDate)}</Text>
                </View>

                {(order.status.toLowerCase() === 'completed' || 
                  order.status.toLowerCase() === 'delivered' || 
                  order.status === 'Completed' || 
                  order.status === 'Delivered') && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>पूरा होने की तारीख:</Text>
                        <Text style={[styles.infoValue, { color: '#48BB78' }]}>
                            {formatDate(order.deliveryDate || order.updatedAt)}
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
                {order.items && order.items.map((item, index) => (
                    <View key={index} style={styles.productCard}>
                        {/* Product Image */}
                        {item.product && item.product.images && item.product.images.length > 0 ? (
                            <Image 
                                source={{ uri: item.product.images[0] }}
                                style={styles.productImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={[styles.productImage, styles.noImage]}>
                                <Ionicons name="image-outline" size={30} color="#CBD5E0" />
                            </View>
                        )}
                        
                        {/* Product Details */}
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.product?.name || 'प्रोडक्ट का नाम'}</Text>
                            <Text style={styles.quantityText}>मात्रा: {item.quantity} पीस</Text>
                            <Text style={styles.priceText}>₹{item.price} प्रति पीस</Text>
                            <Text style={styles.subtotalText}>कुल: ₹{item.subtotal}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person" size={20} color="#4A5568" />
                    <Text style={styles.sectionTitle}>ग्राहक की जानकारी</Text>
                </View>

                <View style={styles.customerCard}>
                    <Text style={styles.customerName}>
                        {order.shippingAddress?.fullName || `${order.buyer?.firstname} ${order.buyer?.lastname}`}
                    </Text>

                    {customerHistory && (
                        <View style={styles.customerBadge}>
                            <Text style={styles.customerBadgeText}>
                                {customerHistory.customerSummary.loyaltyStatus}
                            </Text>
                        </View>
                    )}

                    {/* Phone Number with Call Button */}
                    {order.shippingAddress?.phone && (
                        <TouchableOpacity 
                            style={styles.phoneButton}
                            onPress={() => handleCall(order.shippingAddress.phone)}
                        >
                            <Ionicons name="call" size={20} color="#48BB78" />
                            <Text style={styles.phoneText}>{order.shippingAddress.phone}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Shipping Address */}
                    <View style={styles.addressBox}>
                        <Ionicons name="location" size={20} color="#4A5568" />
                        <View style={styles.addressDetails}>
                            <Text style={styles.addressLabel}>डिलीवरी का पता:</Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress?.street},
                                {'\n'}{order.shippingAddress?.city}, 
                                {'\n'}{order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Payment Information */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="wallet" size={20} color="#4A5568" />
                    <Text style={styles.sectionTitle}>पेमेंट की जानकारी</Text>
                </View>

                <View style={styles.paymentCard}>
                    {/* Payment Status Badge */}
                    <View style={[styles.paymentBadge, { 
                        backgroundColor: order.payment?.status === 'paid' ? '#48BB7820' : '#FFA50020' 
                    }]}>
                        <Ionicons 
                            name={order.payment?.status === 'paid' ? "checkmark-circle" : "time"} 
                            size={20} 
                            color={order.payment?.status === 'paid' ? '#48BB78' : '#FFA500'} 
                        />
                        <Text style={[styles.paymentStatusText, { 
                            color: order.payment?.status === 'paid' ? '#48BB78' : '#FFA500' 
                        }]}>
                            {order.payment?.status === 'paid' ? 'भुगतान प्राप्त' : 'भुगतान बाकी'}
                        </Text>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.paymentMethod}>
                        <Text style={styles.methodLabel}>भुगतान का तरीका:</Text>
                        <Text style={styles.methodValue}>{order.payment?.method || 'COD'}</Text>
                    </View>

                    {/* Payment Details */}
                    <View style={styles.paymentDetails}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>प्रोडक्ट का मूल्य:</Text>
                            <Text style={styles.paymentValue}>₹{order.subtotal}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>डिलीवरी चार्ज:</Text>
                            <Text style={styles.paymentValue}>₹{order.shippingCost}</Text>
                        </View>
                        <View style={[styles.paymentRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>कुल राशि:</Text>
                            <Text style={styles.totalValue}>₹{order.total}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Delivery Information */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="local-shipping" size={20} color="#4A5568" />
                    <Text style={styles.sectionTitle}>डिलीवरी की जानकारी</Text>
                </View>

                <View style={styles.deliveryCard}>
                    <View style={styles.deliveryRow}>
                        <Text style={styles.deliveryLabel}>अनुमानित डिलीवरी:</Text>
                        <Text style={styles.deliveryValue}>
                            {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '3-5 दिन में'}
                        </Text>
                    </View>
                    
                    <View style={styles.deliveryRow}>
                        <Text style={styles.deliveryLabel}>वर्तमान स्थिति:</Text>
                        <Text style={[styles.deliveryValue, { color: getStatusColor(order.status) }]}>
                            {getStatusText(order.status)}
                        </Text>
                    </View>

                    {order.deliveryDate && (
                        <View style={styles.deliveryRow}>
                            <Text style={styles.deliveryLabel}>डिलीवरी की तारीख:</Text>
                            <Text style={styles.deliveryValue}>{formatDate(order.deliveryDate)}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Customer Review */}
            {order.review && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="star" size={20} color="#F6E05E" />
                        <Text style={styles.sectionTitle}>ग्राहक की राय</Text>
                    </View>

                    <View style={styles.reviewCard}>
                        {/* Star Rating */}
                        <View style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FontAwesome
                                    key={star}
                                    name={star <= order.review.rating ? "star" : "star-o"}
                                    size={20}
                                    color="#F6E05E"
                                    style={styles.starIcon}
                                />
                            ))}
                            <Text style={styles.ratingText}>{order.review.rating}/5</Text>
                        </View>

                        {/* Review Comment */}
                        <Text style={styles.reviewText}>
                            {order.review.comment || 'कोई टिप्पणी नहीं'}
                        </Text>

                        {/* Review Date */}
                        <Text style={styles.reviewDate}>
                            समीक्षा की तारीख: {formatDate(order.review.createdAt)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Return/Refund Request */}
            {order.returnRequest && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="assignment-return" size={20} color="#E53E3E" />
                        <Text style={styles.sectionTitle}>रिटर्न/रिफंड की जानकारी</Text>
                    </View>

                    <View style={styles.returnCard}>
                        <Text style={styles.returnStatus}>
                            स्थिति: {order.returnRequest.status}
                        </Text>
                        <Text style={styles.returnReason}>
                            कारण: {order.returnRequest.reason}
                        </Text>
                        <Text style={styles.returnDate}>
                            अनुरोध की तारीख: {formatDate(order.returnRequest.createdAt)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Customer History */}
            {customerHistory && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="history" size={20} color="#4A5568" />
                        <Text style={styles.sectionTitle}>ग्राहक का ऑर्डर इतिहास</Text>
                    </View>

                    <View style={styles.historyCard}>
                        <View style={styles.historySummary}>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyNumber}>{customerHistory.customerSummary.totalOrders}</Text>
                                <Text style={styles.historyLabel}>कुल ऑर्डर</Text>
                            </View>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyNumber}>{customerHistory.customerSummary.successfulDeliveries}</Text>
                                <Text style={styles.historyLabel}>सफल डिलीवरी</Text>
                            </View>
                            <View style={styles.historyItem}>
                                <Text style={styles.historyNumber}>₹{customerHistory.customerSummary.totalSpent}</Text>
                                <Text style={styles.historyLabel}>कुल खरीदारी</Text>
                            </View>
                        </View>

                        {customerHistory.repeatedProducts.length > 0 && (
                            <View style={styles.repeatedProducts}>
                                <Text style={styles.repeatedTitle}>दोबारा खरीदे गए प्रोडक्ट:</Text>
                                {customerHistory.repeatedProducts.map((product, index) => (
                                    <View key={index} style={styles.repeatedItem}>
                                        <Image 
                                            source={{ uri: product.image }}
                                            style={styles.repeatedImage}
                                        />
                                        <View style={styles.repeatedInfo}>
                                            <Text style={styles.repeatedName}>{product.name}</Text>
                                            <View style={styles.repeatedStatusRow}>
                                                <Text style={styles.repeatedCount}>
                                                    कुल खरीदे: {product.totalPurchased} बार
                                                </Text>
                                                <View style={[
                                                    styles.statusIndicator,
                                                    { backgroundColor: product.status?.toLowerCase() === 'completed' || 
                                                                      product.status?.toLowerCase() === 'delivered' 
                                                                      ? '#48BB7820' : '#FFA50020' }
                                                ]}>
                                                    <Ionicons 
                                                        name={product.status?.toLowerCase() === 'completed' || 
                                                              product.status?.toLowerCase() === 'delivered'
                                                              ? "checkmark-circle" 
                                                              : "time"} 
                                                        size={16} 
                                                        color={product.status?.toLowerCase() === 'completed' || 
                                                               product.status?.toLowerCase() === 'delivered'
                                                               ? '#48BB78' 
                                                               : '#FFA500'} 
                                                    />
                                                    <Text style={[
                                                        styles.statusText,
                                                        { color: product.status?.toLowerCase() === 'completed' || 
                                                                 product.status?.toLowerCase() === 'delivered'
                                                                 ? '#48BB78' 
                                                                 : '#FFA500' }
                                                    ]}>
                                                        {product.status?.toLowerCase() === 'completed' || 
                                                         product.status?.toLowerCase() === 'delivered'
                                                         ? 'पूरा हो गया' 
                                                         : 'चल रहा है'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.repeatedDate}>
                                                आखिरी खरीद: {formatDate(product.lastPurchased)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    section: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginLeft: 8,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#718096',
        width: 120,
    },
    infoValue: {
        fontSize: 14,
        color: '#2D3748',
        flex: 1,
        fontWeight: '500',
    },
    productCard: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
        marginBottom: 8,
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
        flex: 1,
        marginLeft: 12,
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
        marginBottom: 2,
    },
    subtotalText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#48BB78',
    },
    customerCard: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
    },
    customerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 8,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#48BB7820',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    phoneText: {
        color: '#48BB78',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    addressBox: {
        flexDirection: 'row',
        backgroundColor: '#EDF2F7',
        padding: 12,
        borderRadius: 8,
    },
    addressDetails: {
        marginLeft: 8,
        flex: 1,
    },
    addressLabel: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#2D3748',
        lineHeight: 20,
    },
    paymentCard: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    paymentStatusText: {
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
    },
    paymentMethod: {
        marginBottom: 12,
    },
    methodLabel: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 4,
    },
    methodValue: {
        fontSize: 16,
        color: '#2D3748',
        fontWeight: '500',
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
        fontWeight: '500',
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
        color: '#48BB78',
    },
    deliveryCard: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
    },
    deliveryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    deliveryLabel: {
        fontSize: 14,
        color: '#718096',
    },
    deliveryValue: {
        fontSize: 14,
        color: '#2D3748',
        fontWeight: '500',
    },
    reviewCard: {
        backgroundColor: '#FFFFF0',
        padding: 12,
        borderRadius: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    starIcon: {
        marginRight: 4,
    },
    ratingText: {
        fontSize: 14,
        color: '#4A5568',
        marginLeft: 8,
    },
    reviewText: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    reviewDate: {
        fontSize: 12,
        color: '#718096',
    },
    returnCard: {
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 8,
    },
    returnStatus: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E53E3E',
        marginBottom: 8,
    },
    returnReason: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 8,
    },
    returnDate: {
        fontSize: 12,
        color: '#718096',
    },
    historyCard: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 8,
    },
    historySummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    historyItem: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    historyNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    historyLabel: {
        fontSize: 14,
        color: '#718096',
    },
    repeatedProducts: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F7FAFC',
        borderRadius: 8,
    },
    repeatedTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 8,
    },
    repeatedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    repeatedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    repeatedInfo: {
        flex: 1,
    },
    repeatedName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    repeatedCount: {
        fontSize: 14,
        color: '#4A5568',
    },
    repeatedDate: {
        fontSize: 12,
        color: '#718096',
    },
    customerBadge: {
        backgroundColor: '#48BB7820',
        padding: 4,
        borderRadius: 4,
        marginBottom: 12,
    },
    customerBadgeText: {
        fontSize: 14,
        color: '#48BB78',
        fontWeight: '500',
    },
    repeatedStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
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
    errorText: {
        fontSize: 16,
        color: '#E53E3E',
    },
});

export default OrderDetails; 
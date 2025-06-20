import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductsScreen = () => {
    const router = useRouter();
    const { category, products, categoryColor } = useLocalSearchParams();
    const { addToCart } = useCart();

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/product/${item._id}`)}
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
                <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: categoryColor }]}
                    onPress={() => addToCart(item)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{category}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Products Grid */}
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.productGrid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            No products found in this category
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    productGrid: {
        padding: 16,
        gap: 16,
    },
    productCard: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
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
    productImage: {
        width: CARD_WIDTH,
        height: CARD_WIDTH,
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4169E1',
    },
    addButton: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4169E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default ProductsScreen; 
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from '../../../config/axios';
import ProductCard from '../../../components/ProductCard';

export default function CategoryScreen() {
    const { name } = useLocalSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategoryProducts();
    }, [name]);

    const fetchCategoryProducts = async () => {
        try {
            const response = await axios.get(`/api/products/category/${name}`);
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4169E1" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <FlatList
                data={products}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={item => item._id}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
            />
        </View>
    );
} 
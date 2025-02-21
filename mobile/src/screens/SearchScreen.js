// mobile/src/screens/SearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  Pressable,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import axios from '../config/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchApi } from '../api/searchApi';
import { productApi } from '../api/productApi';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentSearches, clearRecentSearches } from '../store/searchSlice';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState([
    'Vegetables',
    'Marathi Food',
    'Traditional Pickles',
    'Organic Products',
    'Home Made Food'
  ]);
  const [popularProducts, setPopularProducts] = useState([]);
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get recent searches from Redux store
  const recentSearches = useSelector(state => state.search.recentSearches);

  // Fetch popular products on mount
  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      const { products } = await productApi.getPopularProducts();
      setPopularProducts(products);
    } catch (error) {
      console.error('Error fetching popular products:', error);
    }
  };

  // Handle search submission
  const handleSearch = async (query) => {
    try {
      const { products } = await productApi.searchProducts(query);
      setSearchResults(products);
      dispatch(addToRecentSearches(query));
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Get search suggestions as user types
  const getSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const { suggestions } = await searchApi.getSearchSuggestions(query);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  // Handle clearing recent searches
  const handleClearSearches = () => {
    dispatch(clearRecentSearches());
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        router.push(`/(app)/product/${item._id}`);
      }}
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
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFB100" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.numReviews})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchChip}
      onPress={() => handleSearch(item)}
    >
      <MaterialIcons name="history" size={16} color="#666" />
      <Text style={styles.chipText}>{item}</Text>
      <TouchableOpacity
        onPress={() => dispatch(clearRecentSearches())}
        style={styles.closeButton}
      >
        <MaterialIcons name="close" size={16} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTrendingSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchChip}
      onPress={() => handleSearch(item)}
    >
      <MaterialIcons name="trending-up" size={16} color="#666" />
      <Text style={styles.chipText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              getSuggestions(text);
            }}
            placeholder="Search products..."
            placeholderTextColor="#666"
            autoFocus={true}
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSuggestions([]);
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={handleClearSearches}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {recentSearches.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchChip}
                    onPress={() => handleSearch(item)}
                  >
                    <MaterialIcons name="history" size={16} color="#666" />
                    <Text style={styles.chipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Trending Searches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {trendingSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchChip}
                  onPress={() => handleSearch(item)}
                >
                  <MaterialIcons name="trending-up" size={16} color="#666" />
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Popular in Your City */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular in Your City</Text>
          <View style={styles.popularGrid}>
            {popularProducts.map((product, index) => (
              <Pressable
                key={index}
                style={styles.popularItem}
                onPress={() => router.push(`/product/${product._id}`)}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.popularImage}
                />
                <Text style={styles.popularName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.popularPrice}>₹{product.price}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Search Suggestions */}
        {searchQuery && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSearch(item)}
              >
                <MaterialIcons name="search" size={20} color="#666" />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.listContent}
          />
        ) : searchQuery ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No products found</Text>
          </View>
        ) : (
          <View style={styles.recentSearches}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => setSearchQuery(search)}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.recentText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  productItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  recentSearchesContainer: {
    padding: 16,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  recentSearchItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
  },
  recentSearches: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  recentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  popularItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popularImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  popularName: {
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
  },
  popularPrice: {
    fontSize: 14,
    color: '#3861fb',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});

export default SearchScreen;
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
  ScrollView,
  Alert
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
  const [buyerCity, setBuyerCity] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Remove the auth selector since we'll fetch city directly
  const recentSearches = useSelector(state => state.search.recentSearches) || [];

  // Fetch buyer's city when component mounts
  useEffect(() => {
    fetchBuyerCity();
  }, []);

  const fetchBuyerCity = async () => {
    try {
      const response = await axios.get('/api/buyer/city');
      if (response.data.success) {
        setBuyerCity(response.data.city);
      }
    } catch (err) {
      console.error('Error fetching buyer city:', err);
      Alert.alert(
        "Error",
        "Failed to fetch your city. Some products might not be visible.",
        [{ text: "OK" }]
      );
    }
  };

  // Fetch popular products when city is available
  useEffect(() => {
    if (buyerCity) {
      fetchPopularProducts();
    }
  }, [buyerCity]);

  const fetchPopularProducts = async () => {
    try {
      const response = await axios.get(`/api/search/popular-by-city?city=${encodeURIComponent(buyerCity)}`);
      if (response.data.success) {
        setPopularProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching popular products:', error);
      setPopularProducts([]);
    }
  };

  // Update getSuggestions to use buyerCity instead of city from auth
  const getSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    console.log('Getting suggestions for:', { query, city: buyerCity });
    
    try {
      const response = await axios.get(`/api/search/suggestions?query=${encodeURIComponent(query)}&city=${encodeURIComponent(buyerCity)}`);
      console.log('Suggestions response:', response.data);
      
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]); // Clear suggestions immediately
    Keyboard.dismiss();
    
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/search?query=${suggestion}&city=${buyerCity}`);
      if (response.data.success) {
        setSearchResults(response.data.products);
        dispatch(addToRecentSearches(suggestion));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trending searches
  const fetchTrendingSearches = async () => {
    try {
      const response = await axios.get('/api/search/trending');
      if (response.data.success) {
        setTrendingSearches(response.data.trending);
      }
    } catch (error) {
      console.error('Error fetching trending searches:', error);
    }
  };

  useEffect(() => {
    fetchTrendingSearches();
  }, []);

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
      onPress={() => handleSuggestionClick(item)}
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
      onPress={() => handleSuggestionClick(item)}
    >
      <MaterialIcons name="trending-up" size={16} color="#666" />
      <Text style={styles.chipText}>{item}</Text>
    </TouchableOpacity>
  );

  // Show suggestions section
  const renderSuggestionsSection = () => {
    if (!searchQuery || !suggestions.length) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <FlatList
          data={suggestions}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSuggestionClick(item)}
            >
              <MaterialIcons name="search" size={20} color="#666" />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  // Show loading indicator when searching
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Keyboard.dismiss();
            router.back();
          }}
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
              if (text.length >= 2) {
                getSuggestions(text);
              } else {
                setSuggestions([]);
              }
            }}
            placeholder="Search products..."
            placeholderTextColor="#666"
            autoFocus={true}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                handleSuggestionClick(searchQuery);
              }
            }}
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          {searchQuery.length > 0 ? (
            suggestions.length > 0 ? (
              renderSuggestionsSection()
            ) : (
              searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderProductItem}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                  columnWrapperStyle={styles.productRow}
                  contentContainerStyle={styles.listContent}
                />
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No products found</Text>
                </View>
              )
            )
          ) : (
            <ScrollView style={styles.content}>
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <TouchableOpacity onPress={handleClearSearches}>
                      <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipContainer}>
                      {recentSearches.map((search, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.searchChip}
                          onPress={() => handleSuggestionClick(search)}
                        >
                          <MaterialIcons name="history" size={16} color="#666" />
                          <Text style={styles.chipText}>{search}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Searches</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {trendingSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.searchChip}
                        onPress={() => handleSuggestionClick(search)}
                      >
                        <MaterialIcons name="trending-up" size={16} color="#666" />
                        <Text style={styles.chipText}>{search}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {popularProducts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Popular in Your City</Text>
                  <View style={styles.popularGrid}>
                    {popularProducts.map((product) => (
                      <Pressable
                        key={product._id}
                        style={styles.popularItem}
                        onPress={() => router.push(`/product/${product._id}`)}
                      >
                        <Image
                          source={{ uri: product.images[0] }}
                          style={styles.popularImage}
                        />
                        <View style={styles.popularContent}>
                          <Text style={styles.popularName} numberOfLines={1}>
                            {product.name}
                          </Text>
                          <View style={styles.priceRow}>
                            <Text style={styles.popularPrice}>₹{product.price}</Text>
                            <Text style={styles.perPiece}>per 1 piece</Text>
                          </View>
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color="#FFB100" />
                            <Text style={styles.ratingText}>
                              {product.rating ? product.rating.toFixed(1) : '0.0'}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </>
      )}
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
    backgroundColor: '#fff',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
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
    flexDirection: 'column',
    gap: 8,
  },
  popularItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 100,
    marginHorizontal: 2,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  popularImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  popularContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  popularName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  popularPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3861fb',
  },
  perPiece: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  noPopularText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70, // Height of header
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    zIndex: 1000,
    maxHeight: '70%',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default SearchScreen;
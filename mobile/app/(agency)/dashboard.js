import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { Stack } from 'expo-router';
import { Card } from 'react-native-paper';
import axios from '../../src/config/axios';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const translations = {
  en: {
    welcome: 'Welcome',
    dashboard: 'Agency Dashboard',
    stats: {
      title: 'Overview',
      totalAuctions: 'Total Auctions',
      activeAuctions: 'Active Auctions',
      wonAuctions: 'Won Auctions',
      investment: 'Total Investment',
    },
    menu: {
      profile: 'Profile',
      auctions: 'Live Auctions',
      myBids: 'My Bids',
      wonProducts: 'Won Products',
      payments: 'Payments',
      settings: 'Settings',
      logout: 'Logout',
    },
    liveAuctions: 'My Bids',
    viewAll: 'View All',
    bidNow: 'Bid Now',
    perKg: '/kg',
    endingIn: 'Ending in',
    days: 'days',
    currentBid: 'Current Bid',
    yourLastBid: 'Your Last Bid',
    noAuctions: 'No live auctions available',
    categories: 'Categories',
    products: 'Products',
    tabs: {
      dashboard: 'Dashboard',
      auctions: 'Live Auctions',
      myBids: 'My Bids',
      profile: 'Profile'
    },
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    phone: 'Phone Number',
    alternatePhone: 'Alternate Phone',
    email: 'Email',
    businessLicense: 'Business License',
    website: 'Website',
    address: 'Address',
    fullAddress: 'Full Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    notProvided: 'Not Provided',
    errorLoadingProfile: 'Error loading profile',
  },
  hi: {
    welcome: 'स्वागत है',
    dashboard: 'एजेंसी डैशबोर्ड',
    stats: {
      title: 'अवलोकन',
      totalAuctions: 'कुल नीलामी',
      activeAuctions: 'सक्रिय नीलामी',
      wonAuctions: 'जीती हुई नीलामी',
      investment: 'कुल निवेश',
    },
    menu: {
      profile: 'प्रोफ़ाइल',
      auctions: 'लाइव नीलामी',
      myBids: 'मेरी बोली',
      wonProducts: 'जीते हुए प्रोडक्ट',
      payments: 'भुगतान',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
    },
    liveAuctions: 'लाइव नीलामी',
    viewAll: 'सभी देखें',
    bidNow: 'बोली लगाएं',
    perKg: '/किलो',
    endingIn: 'समाप्त होने में',
    days: 'दिन',
    currentBid: 'वर्तमान बोली',
    yourLastBid: 'आपकी पिछली बोली',
    noAuctions: 'कोई लाइव नीलामी उपलब्ध नहीं है',
    categories: 'श्रेणियां',
    products: 'उत्पाद',
    tabs: {
      dashboard: 'डैशबोर्ड',
      auctions: 'लाइव नीलामी',
      myBids: 'मेरी बोलियां',
      profile: 'प्रोफ़ाइल'
    },
    personalInfo: 'व्यक्तिगत जानकारी',
    fullName: 'पूरा नाम',
    phone: 'फोन नंबर',
    alternatePhone: 'वैकल्पिक फोन',
    email: 'ईमेल',
    businessLicense: 'व्यवसाय लाइसेंस',
    website: 'वेबसाइट',
    address: 'पता',
    fullAddress: 'पूरा पता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिन कोड',
    notProvided: 'नहीं दिया गया',
    errorLoadingProfile: 'प्रोफ़ाइल लोड करने में त्रुटि',
  },
};

// Add getCategoryImage function
const getCategoryImage = (category) => {
  // Get current date to use as seed for image selection
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Multiple image options for each category that will rotate daily
  const categoryImages = {
    'Vegetables': [
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=2012&auto=format&fit=crop'
    ],
    'Fruits': [
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?q=80&w=2070&auto=format&fit=crop'
    ],
    'Organic': [
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2087&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506484381205-f7945653044d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=2070&auto=format&fit=crop'
    ],
    'Grains': [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=2025&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop'
    ],
    'Spices': [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600841867003-d904bd142d24?q=80&w=2070&auto=format&fit=crop'
    ]
  };

  // Get default images for categories not in the list
  const defaultImages = [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2007&auto=format&fit=crop'
  ];

  // Find matching category (case-insensitive)
  const categoryKey = Object.keys(categoryImages).find(
    key => category.toLowerCase().includes(key.toLowerCase())
  );

  // Get image array for the category or use default
  const images = categoryKey ? categoryImages[categoryKey] : defaultImages;

  // Use the date string to select an image
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const imageIndex = dayOfYear % images.length;
  
  return images[imageIndex];
};

const StatsCard = ({ icon, number, label, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: color }]}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const TabButton = ({ active, title, icon, onPress }) => (
  <TouchableOpacity
    style={styles.tabButton}
    onPress={onPress}
  >
    <Ionicons 
      name={icon} 
      size={24} 
      color={active ? '#6C63FF' : '#666'} 
    />
    <Text style={[
      styles.tabButtonText,
      active && { color: '#6C63FF', fontWeight: '500' }
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const AgencyDashboard = () => {
  // Router and context hooks first
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  // All useState hooks together
  const [activeTab, setActiveTab] = useState('dashboard');
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    won: 0,
    investment: 0
  });
  const [totalActiveAuctions, setTotalActiveAuctions] = useState(0);
  const [wonAuctions, setWonAuctions] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Add new useEffect for fetching total auctions
  useEffect(() => {
    const fetchTotalAuctions = async () => {
      try {
        const response = await axios.get(`/api/bids/category-wise-auctions/${user._id}`);
        if (response.data.success) {
          setStats(prevStats => ({
            ...prevStats,
            total: response.data.data.totalAuctions || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching total auctions:', error);
      }
    };

    if (user?._id) {
      fetchTotalAuctions();
    }
  }, [user?._id]);

  // All useEffect hooks together
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTotalActiveAuctions = async () => {
      try {
        const response = await axios.get(`/api/bids/active-auctions/${user._id}`);
        if (response.data.success) {
          setTotalActiveAuctions(response.data.totalActiveAuctions || 0);
        }
      } catch (error) {
        console.error('Error fetching total active auctions:', error);
      }
    };
    
    fetchTotalActiveAuctions();
  }, [user._id]);

  useEffect(() => {
    if (activeTab === 'auctions') {
      fetchActiveAuctions();
    } else if (activeTab === 'dashboard' || activeTab === 'myBids') {
      fetchAuctions();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'profile') {
      const fetchProfileData = async () => {
        setProfileLoading(true);
        try {
          const response = await axios.get(`/api/users/agency/${user._id}`);
          if (response.data.success) {
            setProfileData(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [activeTab, user._id]);

  // Add new useEffect for fetching won auctions
  useEffect(() => {
    const fetchWonAuctions = async () => {
      try {
        const response = await axios.get(`/api/b2b/won-auctions/${user._id}`);
        if (response.data.success) {
          setWonAuctions(response.data.totalWonAuctions);
          // Also update the stats
          setStats(prevStats => ({
            ...prevStats,
            won: response.data.totalWonAuctions
          }));
        }
      } catch (error) {
        console.error('Error fetching won auctions:', error);
      }
    };

    if (user?._id) {
      fetchWonAuctions();
    }
  }, [user._id]);

  // Helper functions
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/b2b/categories');
      if (response.data.success) {
        const categoriesWithImages = response.data.categories.map(cat => ({
          ...cat,
          image: getCategoryImage(cat.category)
        }));
        setCategories(categoriesWithImages);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const fetchAuctions = async () => {
    try {
      console.log('Fetching active auctions...');
      const response = await axios.get(`/api/bids/agency-active-bids/${user._id}`);
      console.log('Active auctions response:', response.data);
      
      if (response.data.success) {
        setStats(prevStats => ({
          ...prevStats,
          active: response.data.products.length || 0
        }));

        setLiveAuctions(response.data.products.map(auction => ({
          id: auction.productId,
          name: auction.name,
          image: auction.image,
          currentBid: auction.currentHighestBid || 0,
          yourLastBid: auction.myLastBid || 0,
          isHighestBidder: auction.isHighestBidder,
          auctionEndDate: auction.auctionEndDate,
          stock: auction.stock || 0,
          unitType: auction.unitType || 'kg',
          daysLeft: Math.ceil((new Date(auction.auctionEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        })));
      }
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      setLiveAuctions([]);
    }
  };

  const fetchActiveAuctions = async () => {
    try {
      console.log('Fetching active auctions for agency...');
      const response = await axios.get(`/api/bids/active-auctions/${user._id}`);
      console.log('Active auctions response:', response.data);
      
      if (response.data.success) {
        setLiveAuctions(response.data.activeAuctions.map(auction => ({
          id: auction._id,
          name: auction.name,
          image: auction.images[0],
          currentBid: auction.currentHighestBid || 0,
          yourLastBid: auction.yourLastBid || 0,
          isHighestBidder: auction.isCurrentAgencyHighestBidder || false,
          auctionEndDate: auction.auctionEndDate,
          category: auction.category,
          subcategory: auction.subcategory,
          totalBids: auction.totalBids,
          images: auction.images,
          stock: auction.stock || 0,
          unitType: auction.unitType || 'kg',
          daysLeft: Math.ceil((new Date(auction.auctionEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        })));
      }
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      setLiveAuctions([]);
    }
  };

  const fetchMyBids = async () => {
    try {
      console.log('Fetching my bids...');
      const response = await axios.get(`/api/bids/agency-active-bids/${user._id}`);
      console.log('My bids response:', response.data);
      
      if (response.data.success) {
        setLiveAuctions(response.data.products.map(auction => ({
          id: auction.productId,
          name: auction.name,
          image: auction.image,
          currentBid: auction.currentHighestBid || 0,
          yourLastBid: auction.myLastBid || 0,
          isHighestBidder: auction.isHighestBidder,
          auctionEndDate: auction.auctionEndDate,
          stock: auction.stock || 0,
          unitType: auction.unitType || 'kg',
          daysLeft: Math.ceil((new Date(auction.auctionEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        })));
      }
    } catch (error) {
      console.error('Error fetching my bids:', error);
      setLiveAuctions([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'auctions') {
      fetchActiveAuctions();
    } else if (activeTab === 'myBids') {
      fetchMyBids();
    } else if (activeTab === 'dashboard') {
      fetchAuctions();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/agency/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCategoryPress = (category) => {
    const encodedCategory = encodeURIComponent(category);
    router.push({
      pathname: '/category/[category]',
      params: { category: encodedCategory }
    });
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>{t.stats.title}</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            icon="bar-chart"
            number={stats.total}
            label={t.stats.totalAuctions}
            color="#4CAF50"
            onPress={() => router.push('/(agency)/all-auctions')}
          />
          <StatsCard
            icon="timer"
            number={totalActiveAuctions}
            label={t.stats.activeAuctions}
            color="#2196F3"
            onPress={() => setActiveTab('auctions')}
          />
          <StatsCard
            icon="trophy"
            number={wonAuctions}
            label={t.stats.wonAuctions}
            color="#FF9800"
            onPress={() => router.push('/(agency)/won-auctions')}
          />
          <StatsCard
            icon="wallet"
            number={`₹${stats.investment}`}
            label={t.stats.investment}
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>{t.categories}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
        ) : (
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.category)}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <View style={styles.categoryNameContainer}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.liveAuctionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.liveAuctions}</Text>
          <TouchableOpacity onPress={() => router.push('/(agency)/(tabs)/auctions')}>
            <Text style={styles.viewAllText}>{t.viewAll}</Text>
          </TouchableOpacity>
        </View>

        {liveAuctions.length > 0 ? (
          liveAuctions.map((auction) => (
            <TouchableOpacity 
              key={auction.id}
              style={styles.auctionCard}
              onPress={() => router.push(`/(agency)/product/${auction.id}`)}
              activeOpacity={0.7}
            >
              {!auction.isHighestBidder && (
                <View style={styles.topRightBidButton}>
                  <Text style={styles.bidButtonText}>{t.bidNow}</Text>
                </View>
              )}
              <View style={styles.auctionHeader}>
                <View style={styles.auctionTitleContainer}>
                  <Image 
                    source={{ uri: auction.image }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.auctionTitle}>{auction.name}</Text>
                    <Text style={styles.quantityText}>{auction.stock} {auction.unitType}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.auctionDetails}>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>{t.currentBid}</Text>
                  <Text style={styles.bidValue}>₹{auction.currentBid}{t.perKg}</Text>
                </View>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>{t.yourLastBid}</Text>
                  <Text style={[
                    styles.lastBidValue,
                    auction.isHighestBidder ? styles.highestBidderValue : null
                  ]}>₹{auction.yourLastBid}{t.perKg}</Text>
                </View>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>{t.endingIn}</Text>
                  <Text style={styles.endingValue}>{auction.daysLeft} {t.days}</Text>
                </View>
              </View>
              {auction.isHighestBidder && (
                <View style={styles.highestBidderBadge}>
                  <Text style={styles.highestBidderText}>Current Highest Bidder</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noAuctionsContainer}>
            <Text style={styles.noAuctionsText}>{t.noAuctions}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderAuctionsTab = () => (
    <ScrollView style={styles.content}>
      <View style={styles.liveAuctionsContainer}>
        {liveAuctions.length > 0 ? (
          liveAuctions.map((auction) => (
            <TouchableOpacity 
              key={auction.id} 
              style={styles.auctionCard}
              onPress={() => router.push(`/(agency)/product/${auction.id}`)}
              activeOpacity={0.7}
            >
              {!auction.isHighestBidder && (
                <TouchableOpacity 
                  style={styles.topRightBidButton}
                  onPress={() => router.push(`/(agency)/product/${auction.id}`)}
                >
                  <Text style={styles.bidButtonText}>{t.bidNow}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.auctionHeader}>
                <View style={styles.auctionTitleContainer}>
                  <Image 
                    source={{ uri: auction.image }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.auctionTitle}>{auction.name}</Text>
                    <Text style={styles.quantityText}>{auction.stock} {auction.unitType}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.auctionDetails}>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>{t.currentBid}</Text>
                  <Text style={styles.bidValue}>₹{auction.currentBid}{t.perKg}</Text>
                </View>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>{t.yourLastBid}</Text>
                  <Text style={[
                    styles.lastBidValue,
                    auction.isHighestBidder ? styles.highestBidderValue : null
                  ]}>₹{auction.yourLastBid}{t.perKg}</Text>
                </View>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>{t.endingIn}</Text>
                  <Text style={styles.endingValue}>{auction.daysLeft} {t.days}</Text>
                </View>
              </View>
              {auction.isHighestBidder && (
                <View style={styles.highestBidderBadge}>
                  <Text style={styles.highestBidderText}>Current Highest Bidder</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noAuctionsContainer}>
            <Text style={styles.noAuctionsText}>{t.noAuctions}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderMyBidsTab = () => (
    <ScrollView style={styles.content}>
      {liveAuctions.filter(auction => auction.yourLastBid).length > 0 ? (
        liveAuctions.filter(auction => auction.yourLastBid).map((auction) => (
          <TouchableOpacity 
            key={auction.id}
            style={styles.auctionCard}
            onPress={() => router.push(`/(agency)/product/${auction.id}`)}
            activeOpacity={0.7}
          >
            {!auction.isHighestBidder && (
              <View style={styles.topRightBidButton}>
                <Text style={styles.bidButtonText}>{t.bidNow}</Text>
              </View>
            )}
            <View style={styles.auctionHeader}>
              <View style={styles.auctionTitleContainer}>
                <Image 
                  source={{ uri: auction.image }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.auctionTitle}>{auction.name}</Text>
                  <Text style={styles.quantityText}>{auction.stock} {auction.unitType}</Text>
                </View>
              </View>
            </View>

            <View style={styles.auctionDetails}>
              <View style={styles.bidInfo}>
                <Text style={styles.bidLabel}>{t.currentBid}</Text>
                <Text style={styles.bidValue}>₹{auction.currentBid}{t.perKg}</Text>
              </View>
              <View style={styles.bidInfo}>
                <Text style={styles.bidLabel}>{t.yourLastBid}</Text>
                <Text style={[
                  styles.lastBidValue,
                  auction.isHighestBidder ? styles.highestBidderValue : null
                ]}>₹{auction.yourLastBid}{t.perKg}</Text>
              </View>
              <View style={styles.bidInfo}>
                <Text style={styles.bidLabel}>{t.endingIn}</Text>
                <Text style={styles.endingValue}>{auction.daysLeft} {t.days}</Text>
              </View>
            </View>
            {auction.isHighestBidder && (
              <View style={styles.highestBidderBadge}>
                <Text style={styles.highestBidderText}>Current Highest Bidder</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noAuctionsContainer}>
          <Text style={styles.noAuctionsText}>{t.noBids}</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderProfileTab = () => {
    if (profileLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      );
    }

    if (!profileData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t.errorLoadingProfile}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileData.logoUrl || 'https://via.placeholder.com/150' }}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.profileName}>{profileData.agencyName}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t.personalInfo}</Text>
          <View style={styles.infoCard}>
            <InfoItem icon="person" label={t.fullName} value={`${profileData.firstname} ${profileData.lastname}`} />
            <InfoItem icon="call" label={t.phone} value={profileData.mobileno} />
            <InfoItem icon="call" label={t.alternatePhone} value={profileData.alternateContactNumber} />
            <InfoItem icon="mail" label={t.email} value={profileData.email} />
            <InfoItem icon="business" label={t.businessLicense} value={profileData.businessLicenseNumber} />
            <InfoItem icon="language" label={t.website} value={profileData.website || t.notProvided} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t.address}</Text>
          <View style={styles.infoCard}>
            <InfoItem icon="home" label={t.fullAddress} value={profileData.address} />
            <InfoItem icon="business" label={t.city} value={profileData.city} />
            <InfoItem icon="map" label={t.state} value={profileData.state} />
            <InfoItem icon="pin" label={t.pincode} value={profileData.pincode} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>{t.menu.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'auctions':
        return renderAuctionsTab();
      case 'myBids':
        return renderMyBidsTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderDashboardTab();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t.welcome}</Text>
            <Text style={styles.agencyName}>{user?.agencyName || 'Agency'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(agency)/notifications')}>
            <Ionicons name="notifications" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {renderContent()}

        <View style={styles.tabBar}>
          <TabButton
            active={activeTab === 'dashboard'}
            title={t.tabs.dashboard}
            icon="grid"
            onPress={() => setActiveTab('dashboard')}
          />
          <TabButton
            active={activeTab === 'auctions'}
            title={t.tabs.auctions}
            icon="timer"
            onPress={() => setActiveTab('auctions')}
          />
          <TabButton
            active={activeTab === 'myBids'}
            title={t.tabs.myBids}
            icon="trending-up"
            onPress={() => setActiveTab('myBids')}
          />
          <TabButton
            active={activeTab === 'profile'}
            title={t.tabs.profile}
            icon="person"
            onPress={() => setActiveTab('profile')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Add InfoItem component
const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={24} color="#6C63FF" style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  agencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  liveAuctionsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  viewAllText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  auctionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  auctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  auctionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  auctionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
    fontWeight: '500'
  },
  bidButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  auctionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  bidInfo: {
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bidValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  lastBidValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00C853',
  },
  endingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3D00',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  noAuctionsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  noAuctionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryCard: {
    width: '48%',
    height: 150,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 8,
    alignItems: 'center',
    width: '100%'
  },
  categoryName: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center'
  },
  loader: {
    marginTop: 20,
  },
  highestBidderValue: {
    color: '#4CAF50', // Green color for highest bidder
  },
  highestBidderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highestBidderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  topRightBidButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabButtonText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    marginTop: 10,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    marginLeft: 8,
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  profileSection: {
    // ... Profile information ...
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8
  },
});

export default AgencyDashboard; 
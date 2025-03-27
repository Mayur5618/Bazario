import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sellerApi } from '../../src/api/sellerApi';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24; // 2 cards per row with padding

const ProductsTab = () => {
  // ... rest of the component code stays the same ...
};

const styles = StyleSheet.create({
  // ... styles stay the same ...
});

export default ProductsTab; 
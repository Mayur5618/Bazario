import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const BottomTabs = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Hide bottom tabs on cart and orders screens
  if (pathname.includes('/cart') || pathname.includes('/orders')) {
    return null;
  }

  const isActive = (path) => pathname.includes(path);

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <BlurView intensity={100} style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('/(app)/home')}
      >
        <Ionicons 
          name={isActive('home') ? 'home' : 'home-outline'} 
          size={24} 
          color={isActive('home') ? "#2563eb" : "#666"} 
        />
        <Text style={[styles.navText, isActive('home') && styles.activeNavText]}>
          Home
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('/(app)/categories')}
      >
        <Ionicons 
          name={isActive('categories') ? 'grid' : 'grid-outline'} 
          size={24} 
          color={isActive('categories') ? "#2563eb" : "#666"} 
        />
        <Text style={[styles.navText, isActive('categories') && styles.activeNavText]}>
          Categories
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('/(app)/cart')}
      >
        <Ionicons 
          name={isActive('cart') ? 'cart' : 'cart-outline'} 
          size={24} 
          color={isActive('cart') ? "#2563eb" : "#666"} 
        />
        <Text style={[styles.navText, isActive('cart') && styles.activeNavText]}>
          Cart
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('/(app)/account')}
      >
        <Ionicons 
          name={isActive('account') ? 'person' : 'person-outline'} 
          size={24} 
          color={isActive('account') ? "#2563eb" : "#666"} 
        />
        <Text style={[styles.navText, isActive('account') && styles.activeNavText]}>
          Account
        </Text>
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeNavText: {
    color: '#2563eb',
    fontWeight: '500',
  },
});

export default BottomTabs; 
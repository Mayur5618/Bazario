import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const OrderSuccessScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const handleContinueShopping = () => {
    router.push('/');  // Navigate to home screen
  };

  const handleViewOrder = () => {
    router.push(`/orders/${id}`);  // Navigate to order details
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed and will be delivered soon.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.viewOrderButton]} 
            onPress={handleViewOrder}
          >
            <Text style={styles.buttonText}>View Order</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.continueButton]} 
            onPress={handleContinueShopping}
          >
            <Text style={styles.buttonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <Text style={styles.infoText}>
          We'll send you an email with your order details and tracking information.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewOrderButton: {
    backgroundColor: '#4285f4',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default OrderSuccessScreen; 
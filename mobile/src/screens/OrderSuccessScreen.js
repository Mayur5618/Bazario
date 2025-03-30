import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const OrderSuccessScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        
        <Text style={styles.message}>
          Your order has been placed and will be delivered soon.
        </Text>

        <TouchableOpacity
          style={styles.viewOrderButton}
          onPress={() => router.push('/(app)/orders')}
        >
          <Text style={styles.viewOrderText}>View Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace('/(app)')}
        >
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>

        <Text style={styles.emailText}>
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
  checkmarkContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  viewOrderButton: {
    width: '100%',
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  viewOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});

export default OrderSuccessScreen; 
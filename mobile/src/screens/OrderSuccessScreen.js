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
  const [checkmarkScale] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(checkmarkScale, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <View style={styles.content}>
        <Animated.View style={[styles.checkmarkContainer, {
          transform: [{ scale: checkmarkScale }]
        }]}>
          <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        </Animated.View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        
        <Text style={styles.message}>
          Thank you for your purchase. We'll process your order soon.
        </Text>

        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID:</Text>
          <Text style={styles.orderId}>{orderId}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/(app)/orders')}
          >
            <Ionicons name="list" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(app)')}
          >
            <Ionicons name="home" size={20} color="#4169E1" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
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
    padding: 24,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderIdContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
  },
  orderIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#4169E1',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4169E1',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4169E1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderSuccessScreen; 
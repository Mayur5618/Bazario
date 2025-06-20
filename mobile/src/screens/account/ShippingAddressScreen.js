import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-root-toast';
import { userApi } from '../../api/userApi';

const ShippingAddressScreen = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await userApi.getShippingAddresses();
      setAddresses(response.addresses);
    } catch (error) {
      Toast.show(error.message || 'Error fetching addresses', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleDeleteAddress = async (addressId) => {
    try {
      await userApi.deleteShippingAddress(addressId);
      Toast.show('Address deleted successfully', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      fetchAddresses();
    } catch (error) {
      Toast.show(error.message || 'Error deleting address', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Add New Address Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/account/add-address')}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      {/* Address List */}
      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No addresses found</Text>
          <Text style={styles.emptySubText}>Add a new address to get started</Text>
        </View>
      ) : (
        addresses.map((address) => (
          <View key={address._id} style={styles.addressCard}>
            <View style={styles.addressContent}>
              <Text style={styles.name}>{address.name}</Text>
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} {address.pincode}
              </Text>
              <Text style={styles.phone}>Phone: {address.phone}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteAddress(address._id)}
            >
              <MaterialIcons name="delete" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
});

export default ShippingAddressScreen; 
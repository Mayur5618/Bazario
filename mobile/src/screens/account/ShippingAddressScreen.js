import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-root-toast';
import { userApi } from '../../api/userApi';

const ShippingAddressScreen = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await userApi.getShippingAddresses();
      setAddresses(response.addresses);
    } catch (error) {
      Toast.show(error.message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      await userApi.addShippingAddress(formData);
      Toast.show('Address added successfully', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      setShowForm(false);
      fetchAddresses();
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
      });
    } catch (error) {
      Toast.show(error.message, {
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
      {/* Address List */}
      {addresses.map((address, index) => (
        <View key={index} style={styles.addressCard}>
          <Text style={styles.name}>{address.name}</Text>
          <Text style={styles.addressText}>{address.street}</Text>
          <Text style={styles.addressText}>
            {address.city}, {address.state} {address.pincode}
          </Text>
          <Text style={styles.phone}>Phone: {address.phone}</Text>
        </View>
      ))}

      {/* Add New Address Button */}
      {!showForm && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      )}

      {/* Add Address Form */}
      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={formData.street}
            onChangeText={(text) => setFormData({...formData, street: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => setFormData({...formData, city: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            value={formData.state}
            onChangeText={(text) => setFormData({...formData, state: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            value={formData.pincode}
            keyboardType="numeric"
            onChangeText={(text) => setFormData({...formData, pincode: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => setFormData({...formData, phone: text})}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleAddAddress}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  addressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
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
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  saveButtonText: {
    color: '#fff',
  },
});

export default ShippingAddressScreen; 
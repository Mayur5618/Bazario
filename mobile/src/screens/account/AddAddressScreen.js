import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-root-toast';
import { userApi } from '../../api/userApi';

const AddAddressScreen = () => {
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    pincode: '',
    city: '',
    state: '',
    street: '',
    phone: '',
    email: ''
  });

  // Function to fetch city and state based on pincode
  const handlePincodeChange = async (pincode) => {
    setFormData(prev => ({ ...prev, pincode }));
    
    if (pincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        } else {
          Toast.show('Invalid pincode', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
          });
        }
      } catch (error) {
        Toast.show('Error fetching pincode details', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleSaveAddress = async () => {
    // Validate all fields
    const requiredFields = Object.keys(formData);
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await userApi.addShippingAddress(formData);
      Toast.show('Address added successfully', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      router.back(); // Go back to previous screen
    } catch (error) {
      Toast.show(error.message || 'Error adding address', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Pincode *"
          value={formData.pincode}
          keyboardType="numeric"
          maxLength={6}
          onChangeText={handlePincodeChange}
        />
        
        {pincodeLoading && (
          <ActivityIndicator style={styles.pincodeLoader} size="small" color="#3B82F6" />
        )}

        <TextInput
          style={[styles.input, { backgroundColor: formData.city ? '#f5f5f5' : '#fff' }]}
          placeholder="City *"
          value={formData.city}
          editable={!formData.city}
          onChangeText={(text) => setFormData({...formData, city: text})}
        />

        <TextInput
          style={[styles.input, { backgroundColor: formData.state ? '#f5f5f5' : '#fff' }]}
          placeholder="State *"
          value={formData.state}
          editable={!formData.state}
          onChangeText={(text) => setFormData({...formData, state: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Street Address *"
          value={formData.street}
          onChangeText={(text) => setFormData({...formData, street: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          value={formData.phone}
          keyboardType="phone-pad"
          maxLength={10}
          onChangeText={(text) => setFormData({...formData, phone: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => setFormData({...formData, email: text})}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveAddress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  pincodeLoader: {
    marginBottom: 12,
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

export default AddAddressScreen; 
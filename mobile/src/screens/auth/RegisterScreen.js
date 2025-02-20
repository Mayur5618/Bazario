import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Animated, Modal } from 'react-native';
import axios from '../../config/axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Toast from 'react-native-root-toast';
import { RootSiblingParent } from 'react-native-root-siblings';

const RegisterScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    mobileno: "",
    password: "",
    confirmPassword: "",
    detailAddress: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    userType: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '' });
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Initialize animation values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Validation function
  const validateField = (name, value) => {
    let message = '';
    switch (name) {
      case 'firstname':
        if (!value.trim()) {
          message = 'First name is required';
        }
        break;
      case 'lastname':
        if (!value.trim()) {
          message = 'Last name is required';
        }
        break;
      case 'mobileno':
        if (!value.trim()) {
          message = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(value)) {
          message = 'Mobile number must be 10 digits';
        }
        break;
      case 'password':
        if (!value) {
          message = 'Password is required';
        } else if (value.length < 8) {
          message = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          message = 'Please confirm password';
        } else if (value !== formData.password) {
          message = 'Passwords do not match';
        }
        break;
      case 'detailAddress':
        if (!value.trim()) {
          message = 'Detailed address is required';
        }
        break;
      case 'address':
        if (!value.trim()) {
          message = 'Address is required';
        }
        break;
      case 'country':
        return !value.trim() ? 'Country is required' : '';
      case 'state':
        return !value.trim() ? 'State is required' : '';
      case 'city':
        return !value.trim() ? 'City is required' : '';
      case 'pincode':
        return !value.trim() 
          ? 'Pincode is required' 
          : !/^[0-9]{6}$/.test(value) 
          ? 'Invalid pincode' 
          : '';
      default:
        return '';
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (currentStep) => {
    const fieldsToValidate = currentStep === 1 
      ? ['firstname', 'lastname', 'mobileno', 'password', 'confirmPassword']
      : ['detailAddress', 'address', 'country', 'state', 'city', 'pincode'];

    const newErrors = {};
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setShowLocationModal(true);
      } else {
        Toast.show('Location permission denied. Please enter your address manually.', {
          duration: 3000,
          position: Toast.positions.CENTER,
          backgroundColor: '#ff6b6b',
        });
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
      Toast.show('Error accessing location. Please enter address manually.', {
        duration: 3000,
        position: Toast.positions.CENTER,
        backgroundColor: '#ff6b6b',
      });
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        // Format the detailed address
        const detailedAddress = [
          address.name,
          address.streetNumber,
          address.street,
          address.district,
          address.subregion,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean).join(', ');

        // Format the street address
        const streetAddress = [
          address.streetNumber,
          address.street,
          address.district,
        ].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          detailAddress: detailedAddress || '',
          address: streetAddress || '',
          country: address.country || '',
          state: address.region || '',
          city: address.city || '',
          pincode: address.postalCode || ''
        }));
      }
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert(
        "Location Error",
        "Could not get your location. Please enter address manually."
      );
    } finally {
      setIsLocationLoading(false);
    }
  };

  const validateFirstStep = () => {
    const newErrors = {};
    const fieldsToValidate = {
      firstname: "First Name",
      lastname: "Last Name",
      mobileno: "Mobile Number",
      password: "Password",
      confirmPassword: "Confirm Password"
    };

    // Check for empty fields
    const emptyFields = [];
    Object.entries(fieldsToValidate).forEach(([field, label]) => {
      if (!formData[field].trim()) {
        emptyFields.push(label);
        newErrors[field] = `${label} is required`;
      }
    });

    if (emptyFields.length > 0) {
      Toast.show(`Please fill in all required fields:\n${emptyFields.join("\n")}`, {
        duration: 3000,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: '#333',
        textColor: '#fff',
        opacity: 1,
        containerStyle: {
          padding: 15,
          borderRadius: 10,
          width: '80%'
        }
      });
      setErrors(newErrors);
      return false;
    }

    // Additional validations
    if (!/^[0-9]{10}$/.test(formData.mobileno)) {
      Toast.show('Mobile number must be 10 digits', {
        duration: 3000,
        position: Toast.positions.CENTER,
        backgroundColor: '#333',
      });
      setErrors({ ...newErrors, mobileno: 'Mobile number must be 10 digits' });
      return false;
    }

    if (formData.password.length < 8) {
      Toast.show('Password must be at least 8 characters', {
        duration: 3000,
        position: Toast.positions.CENTER,
        backgroundColor: '#333',
      });
      setErrors({ ...newErrors, password: 'Password must be at least 8 characters' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show('Passwords do not match', {
        duration: 3000,
        position: Toast.positions.CENTER,
        backgroundColor: '#333',
      });
      setErrors({ ...newErrors, confirmPassword: 'Passwords do not match' });
      return false;
    }

    setErrors({});
    return true;
  };

  const showNotification = (message) => {
    setNotification({ visible: true, message });

    // Reset animation values
    slideAnim.setValue(-100);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    // Start animations
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      })
    ]).start();

    // Auto hide after 2 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setNotification({ visible: false, message: '' });
      });
    }, 2000);
  };

  const handleNextStep = async () => {
    // Check for empty fields
    const emptyFields = [];
    if (!formData.firstname.trim()) emptyFields.push('First Name');
    if (!formData.lastname.trim()) emptyFields.push('Last Name');
    if (!formData.mobileno.trim()) emptyFields.push('Mobile Number');
    if (!formData.password.trim()) emptyFields.push('Password');
    if (!formData.confirmPassword.trim()) emptyFields.push('Confirm Password');

    if (emptyFields.length > 0) {
      showNotification('Please fill all required fields');
      return;
    }

    // Validate mobile number
    if (formData.mobileno.length !== 10) {
      showNotification('Mobile number must be 10 digits');
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      showNotification('Password must be at least 6 characters');
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match');
      return;
    }

    // Check if mobile exists
    try {
      setIsLoading(true);
      const response = await axios.post('/api/users/check-mobile', {
        mobileno: formData.mobileno
      });

      if (response.data.exists) {
        showNotification('This mobile number is already registered');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep(2);
    } catch (error) {
      setIsLoading(false);
      showNotification(error.response?.data?.message || 'Error checking mobile number');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...dataToSubmit } = formData;
      const response = await axios.post('/api/users/signup', dataToSubmit);
      
      if (response.data.success) {
        Toast.show('Account created successfully!', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        });
        
        // Navigate after showing toast
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1000);
      }
    } catch (error) {
      Toast.show(error.response?.data?.message || 'Registration failed', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: '#ff6b6b',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressFields = () => (
    <View style={styles.inputGroup}>
      <View style={styles.inputBox}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detailed Address (e.g., Flat No, Building Name, Street, Area)"
          value={formData.detailAddress}
          onChangeText={(text) => handleChange('detailAddress', text)}
          editable={!isLocationLoading}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        {isLocationLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.locationButton}
        onPress={requestLocationPermission}
      >
        <Ionicons name="location" size={20} color="#6C63FF" />
        <Text style={styles.locationButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Landmark/Street"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        )}
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={formData.country}
          onChangeText={(text) => handleChange('country', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        )}
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="State"
          value={formData.state}
          onChangeText={(text) => handleChange('state', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        )}
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => handleChange('city', text)}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        )}
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={formData.pincode}
          onChangeText={(text) => handleChange('pincode', text)}
          keyboardType="numeric"
          maxLength={6}
          editable={!isLocationLoading}
        />
        {isLocationLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      {renderAddressFields()}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.registerButton, isLoading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const LocationAccessModal = ({ visible, onClose, onConfirm }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIcon}>
            <Ionicons name="location-outline" size={32} color="#6C63FF" />
          </View>
          <Text style={styles.modalTitle}>Location Access</Text>
          <Text style={styles.modalMessage}>
            Would you like to use your current location to fill address details?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonNo]} 
              onPress={onClose}
            >
              <Text style={styles.modalButtonTextNo}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonYes]} 
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonTextYes}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="First Name"
            placeholderTextColor="#999"
            value={formData.firstname}
            onChangeText={(text) => handleChange('firstname', text)}
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Last Name"
            placeholderTextColor="#999"
            value={formData.lastname}
            onChangeText={(text) => handleChange('lastname', text)}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={10}
          value={formData.mobileno}
          onChangeText={(text) => handleChange('mobileno', text)}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
        />
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
        onPress={handleNextStep}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Please wait...' : 'Next'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text 
            style={styles.signInLink}
            onPress={() => router.push('/(auth)/login')}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </View>
  );

  return (
    <RootSiblingParent>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="person-add" size={40} color="#6C63FF" />
            </View>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Step {step} of 2</Text>
          </View>

          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}

          {step === 1 ? (
            renderStep1()
          ) : (
            renderStep2()
          )}
        </ScrollView>

        {/* Animated Notification */}
        {notification.visible && (
          <Animated.View
            style={[
              styles.notification,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
                opacity: fadeAnim
              }
            ]}
          >
            <View style={styles.notificationContent}>
              <Ionicons name="alert-circle" size={24} color="#fff" />
              <Text style={styles.notificationText}>{notification.message}</Text>
            </View>
          </Animated.View>
        )}

        <LocationAccessModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onConfirm={() => {
            setShowLocationModal(false);
            getCurrentLocation();
          }}
        />
      </SafeAreaView>
    </RootSiblingParent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F0EEFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    gap: 15,
  },
  inputBox: {
    position: 'relative',
    width: '100%',
  },
  input: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
    marginBottom: 0,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButton: {
    flex: 2,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#666',
  },
  signInLink: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#F0EEFF',
    borderRadius: 12,
  },
  locationButtonText: {
    marginLeft: 8,
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  notification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#333',
    margin: 16,
    marginTop: 50,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonNo: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonYes: {
    backgroundColor: '#6C63FF',
  },
  modalButtonTextNo: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextYes: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen;
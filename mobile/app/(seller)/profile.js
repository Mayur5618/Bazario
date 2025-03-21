import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../src/config/axios';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    shopName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profileImage: null,
    bio: '',
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/sellers/${user?._id}`);
      const statsResponse = await axios.get('/api/seller/dashboard-stats');
      
      if (response.data) {
        const { seller } = response.data;
        const stats = statsResponse.data?.stats || {};
        
        setProfileData({
          name: `${seller.firstname} ${seller.lastname}` || '',
          shopName: seller.shopName || '',
          phone: seller.mobileno || '',
          email: seller.email || '',
          address: seller.address || '',
          city: seller.city || '',
          state: seller.state || '',
          pincode: seller.pincode || '',
          profileImage: seller.profileImage || null,
          bio: seller.bio || '',
          totalProducts: stats.totalProducts || 0,
          totalOrders: stats.totalOrders || 0,
          totalRevenue: stats.revenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('एरर', 'प्रोफ़ाइल लोड करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    if (!isEditing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageLoading(true);
        
        try {
          console.log('Uploading image to Firebase...');
          
          // Upload base64 image to Firebase
          const uploadResponse = await axios.post('/api/upload/firebase', {
            file: result.assets[0].base64,
            path: `profile-images/${user?._id}-${Date.now()}.jpg`,
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('Upload response:', uploadResponse.data);

          if (uploadResponse.data?.success && uploadResponse.data?.url) {
            console.log('Updating profile with new image URL...');
            
            // Update profile with Firebase URL
            const updateResponse = await axios.put(`/api/users/sellers/${user?._id}`, {
              profileImage: uploadResponse.data.url
            });

            if (updateResponse.data?.success) {
              setProfileData(prev => ({
                ...prev,
                profileImage: uploadResponse.data.url
              }));
              Alert.alert('सफल', 'प्रोफाइल फोटो अपडेट हो गया है');
              fetchProfileData(); // Refresh profile data
            } else {
              throw new Error('प्रोफाइल अपडेट नहीं हो सका');
            }
          } else {
            throw new Error('फोटो अपलोड नहीं हो सका');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError?.response?.data || uploadError);
          Alert.alert(
            'एरर',
            uploadError?.response?.data?.message || 'फोटो अपलोड करने में समस्या हुई। कृपया पुनः प्रयास करें।'
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('एरर', 'फोटो चुनने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/users/sellers/${user?._id}`, profileData);
      if (response.data) {
        Alert.alert('सफल', 'प्रोफ़ाइल अपडेट हो गया है');
        setIsEditing(false);
        fetchProfileData(); // Refresh data after update
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('एरर', 'प्रोफ़ाइल अपडेट करने में समस्या हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "लॉगआउट",
      "क्या आप लॉगआउट करना चाहते हैं?",
      [
        {
          text: "रद्द करें",
          style: "cancel"
        },
        {
          text: "लॉगआउट",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigate to login screen with reset to prevent going back
              router.replace({
                pathname: '/(auth)/login',
                params: { reset: true }
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('एरर', 'लॉगआउट करने में समस्या हुई');
            }
          }
        }
      ]
    );
  };

  const renderField = (label, value, key, keyboardType = 'default', multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            { color: '#333' }
          ]}
          value={value}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, [key]: text }))}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          placeholderTextColor="#999"
          placeholder={`${label} दर्ज करें`}
        />
      ) : (
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value || 'Not provided'}</Text>
          {!value && <Text style={styles.emptyText}>जानकारी उपलब्ध नहीं है</Text>}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>लोड हो रहा है...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>मेरी प्रोफ़ाइल</Text>
        <TouchableOpacity 
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          style={[styles.editButton, isEditing && styles.saveButton]}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "create-outline"} 
            size={20} 
            color="#FFF" 
          />
          <Text style={styles.editButtonText}>
            {isEditing ? 'सेव करें' : 'एडिट करें'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleImagePick} style={styles.imageWrapper}>
            {imageLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
              </View>
            ) : profileData.profileImage ? (
              <Image
                source={{ uri: profileData.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color="#666" />
              </View>
            )}
            {isEditing && !imageLoading && (
              <View style={styles.editImageOverlay}>
                <Ionicons name="camera" size={24} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadText}>
            {isEditing ? (imageLoading ? 'अपलोड हो रहा है...' : 'टैप करके फोटो बदलें') : 'प्रोफाइल फोटो'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.totalProducts}</Text>
            <Text style={styles.statLabel}>प्रोडक्ट</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.totalOrders}</Text>
            <Text style={styles.statLabel}>ऑर्डर</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹{profileData.totalRevenue}</Text>
            <Text style={styles.statLabel}>कमाई</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>लॉगआउट करें</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>व्यक्तिगत जानकारी</Text>
        <View style={styles.form}>
          {renderField('नाम', profileData.name, 'name')}
          {renderField('दुकान का नाम', profileData.shopName, 'shopName')}
          {renderField('फ़ोन नंबर', profileData.phone, 'phone', 'phone-pad')}
          {renderField('ईमेल', profileData.email, 'email', 'email-address')}
        </View>

        <Text style={styles.sectionTitle}>पता</Text>
        <View style={styles.form}>
          {renderField('पता', profileData.address, 'address', 'default', true)}
          {renderField('शहर', profileData.city, 'city')}
          {renderField('राज्य', profileData.state, 'state')}
          {renderField('पिन कोड', profileData.pincode, 'pincode', 'numeric')}
        </View>

        <Text style={styles.sectionTitle}>अतिरिक्त जानकारी</Text>
        <View style={styles.form}>
          {renderField('बायो', profileData.bio, 'bio', 'default', true)}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    padding: 8,
    borderRadius: 20,
  },
  uploadText: {
    color: '#666',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8E8',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 24,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  valueContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loadingContainer: {
    backgroundColor: '#F0F0F0',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen; 
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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../src/config/axios';
import { useAuth } from '../../src/context/AuthContext';
import { sellerApi } from '../../src/api/sellerApi';
import { useLanguage } from '../../src/context/LanguageContext';
import { translations } from '../../src/translations/profile';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, t } = useLanguage(translations);
  const [isEditing, setIsEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    shopName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profileImage: null,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // If translations are not loaded yet, show loading state
  if (!t) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
          address: seller.address || '',
          city: seller.city || '',
          state: seller.state || '',
          pincode: seller.pincode || '',
          profileImage: seller.profileImage || null,
          totalProducts: stats.totalProducts || 0,
          totalOrders: stats.totalOrders || 0,
          totalRevenue: stats.revenue || 0
        });

        // Set products from seller response
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', t.errors.loadProfile);
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
            
            const updateResponse = await axios.put(`/api/users/sellers/${user?._id}`, {
              profileImage: uploadResponse.data.url
            });

            if (updateResponse.data?.success) {
              setProfileData(prev => ({
                ...prev,
                profileImage: uploadResponse.data.url
              }));
              Alert.alert('Success', t.success.photoUpdate);
              fetchProfileData();
            } else {
              throw new Error('Could not update profile');
            }
          } else {
            throw new Error('Could not upload photo');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError?.response?.data || uploadError);
          Alert.alert(
            'Error',
            t.errors.uploadPhoto
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', t.errors.selectPhoto);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const [firstname = '', lastname = ''] = profileData.name.split(' ');
      
      const updateData = {
        firstname,
        lastname,
        shopName: profileData.shopName,
        mobileno: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode
      };

      const response = await axios.put(`/api/users/sellers/${user?._id}`, updateData);
      
      if (response.data) {
        Alert.alert('Success', t.success.profileUpdate);
        setIsEditing(false);
        fetchProfileData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', t.errors.updateProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t.logoutConfirm.title,
      t.logoutConfirm.message,
      [
        {
          text: t.logoutConfirm.cancel,
          style: "cancel"
        },
        {
          text: t.logoutConfirm.confirm,
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace({
                pathname: '/(auth)/login',
                params: { reset: true }
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', t.errors.logout);
            }
          }
        }
      ]
    );
  };

  const renderField = (label, value, key, keyboardType = 'default', multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{t.fields[key]}</Text>
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
          placeholder={`${t.fields[key]} दर्ज करें`}
        />
      ) : (
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value || t.placeholders.notProvided}</Text>
          {!value && <Text style={styles.emptyText}>{t.placeholders.noInfo}</Text>}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleImagePick} disabled={!isEditing}>
            {profileData.profileImage ? (
              <Image
                source={{ uri: profileData.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={64} color="#CCC" />
              </View>
            )}
            <Text style={styles.profileImageText}>
              {isEditing ? (imageLoading ? t.uploadingPhoto : t.editPhoto) : t.profilePhoto}
            </Text>
          </TouchableOpacity>
        </View>

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
            {isEditing ? t.save : t.edit}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statValue}>{profileData.totalProducts}</Text>
            <Text style={styles.statLabel}>{t.stats.products}</Text>
            <Text style={styles.statSubLabel}>{t.stats.totalItems}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statValue}>{profileData.totalOrders}</Text>
            <Text style={styles.statLabel}>{t.stats.orders}</Text>
            <Text style={styles.statSubLabel}>{t.stats.totalSales}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statValue}>₹{profileData.totalRevenue}</Text>
            <Text style={styles.statLabel}>{t.stats.revenue}</Text>
            <Text style={styles.statSubLabel}>{t.stats.totalEarnings}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.sections.personalInfo}</Text>
        <View style={styles.formContainer}>
          {renderField(t.fields.name, profileData.name, 'name')}
          {renderField(t.fields.shopName, profileData.shopName, 'shopName')}
          {renderField(t.fields.phone, profileData.phone, 'phone', 'phone-pad')}
          {renderField(t.fields.address, profileData.address, 'address', 'default', true)}
          {renderField(t.fields.city, profileData.city, 'city')}
          {renderField(t.fields.state, profileData.state, 'state')}
          {renderField(t.fields.pincode, profileData.pincode, 'pincode', 'numeric')}
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productsScroll: {
    marginTop: 12,
  },
  productCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productStock: {
    fontSize: 12,
    color: '#666666',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  profileImageText: {
    color: '#666',
    fontSize: 14,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../src/context/LanguageContext';
import { translations } from '../../src/translations/b2bProductCreate';
import { Picker } from '@react-native-picker/picker';
import axios from '../../src/config/axios';

// B2B Categories
const categories = [
  'Organic Vegetables & Fruits',
  'Natural & Handmade Soaps',
  'Other'
];

const getSubcategories = (category) => {
  const subcategories = {
    'Organic Vegetables & Fruits': ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables'],
    'Natural & Handmade Soaps': ['Body Soaps', 'Face Soaps', 'Handmade Soaps'],
    'Other': ['Other']
  };
  return subcategories[category] || [];
};

const unitTypes = [
  { value: 'kg', label: 'Kilogram' },
  { value: 'piece', label: 'Piece' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'set', label: 'Set' }
];

// Categories and subcategories mapping
const categoryKeys = ['organic', 'soaps', 'other'];

const getSubcategoryKeys = (categoryKey) => {
  const subcategoryMap = {
    'organic': ['vegetables', 'fruits', 'leafy', 'root'],
    'soaps': ['body', 'face', 'handmade'],
    'other': ['other']
  };
  return subcategoryMap[categoryKey] || [];
};

const AddB2BProduct = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');
  const { t } = useLanguage(translations);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    minPrice: '',
    maxPrice: '',
    unitType: 'kg',
    unitPrice: '',
    totalStock: '',
    auctionEndDate: '',
    negotiationEnabled: false,
    images: [],
    youtubeLink: '',
  });

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.category || !formData.subcategory) {
          Alert.alert('Required', 'कृपया सभी आवश्यक फ़ील्ड भरें');
          return false;
        }
        return true;
      case 2:
        if (images.length === 0) {
          Alert.alert('Required', 'कृपया कम से कम एक फोटो अपलोड करें');
          return false;
        }
        return true;
      case 3:
        if (!formData.minPrice || !formData.maxPrice || !formData.unitPrice || !formData.totalStock || !formData.auctionEndDate) {
          Alert.alert('Required', 'कृपया सभी कीमत और स्टॉक की जानकारी भरें');
          return false;
        }
        // Add date format validation
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!datePattern.test(formData.auctionEndDate)) {
          Alert.alert('Error', 'कृपया सही प्रारूप में तारीख दर्ज करें (DD/MM/YYYY)');
          return false;
        }
        const [day, month, year] = formData.auctionEndDate.split('/').map(Number);
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        if (inputDate < today) {
          Alert.alert('Error', 'नीलामी की तारीख आज से पहले नहीं हो सकती');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 3) {
        setShowConfirmation(true);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleImageSource = () => {
    setShowImageSourceModal(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled) {
        setImages(result.assets);
        setFormData(prev => ({
          ...prev,
          images: result.assets.map(asset => asset.uri)
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Upload images first
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          const uploadResponse = await axios.post('/api/products/upload', {
            image: base64Data
          });
          
          if (!uploadResponse.data.success) {
            throw new Error(uploadResponse.data.message || 'Image upload failed');
          }
          
          return uploadResponse.data.url;
        })
      );

      // Convert date from DD/MM/YYYY to ISO format
      const [day, month, year] = formData.auctionEndDate.split('/');
      const auctionEndDate = new Date(year, month - 1, day).toISOString();

      const productData = {
        name: formData.name,
        category: formData.category === 'other' ? formData.customCategory : formData.category,
        subcategory: formData.category === 'other' ? formData.customSubcategory : formData.subcategory,
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
        unitType: formData.unitType,
        Price: parseFloat(formData.unitPrice),
        Stock: parseInt(formData.totalStock),
        auctionEndDate: auctionEndDate,
        negotiationEnabled: formData.negotiationEnabled,
        images: imageUrls,
        platformType: 'b2b'
      };

      const response = await axios.post('/api/products/b2b/products/create', productData);

      if (response.data.success) {
        Alert.alert(
          'सफल',
          'B2B प्रोडक्ट सफलतापूर्वक जोड़ा गया',
          [{ text: 'ठीक है', onPress: () => router.back() }]
        );
      } else {
        throw new Error(response.data.message || 'प्रोडक्ट जोड़ने में समस्या हुई');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert(
        'त्रुटि',
        error.response?.data?.message || error.message || 'प्रोडक्ट जोड़ने में समस्या हुई'
      );
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.basicInfo}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.productName.label}</Text>
        <TextInput
          mode="flat"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder={t.productName.placeholder}
          style={styles.input}
          theme={{ colors: { primary: '#E8E8E8' } }}
          underlineColor="#E8E8E8"
        />
      </View>

      <View style={styles.categoryContainer}>
        <View style={styles.categoryBox}>
          <Text style={styles.label}>{t.category.label}</Text>
          {formData.category === 'other' ? (
            <TextInput
              mode="flat"
              value={customCategory}
              onChangeText={(text) => {
                setCustomCategory(text);
                setFormData(prev => ({ 
                  ...prev, 
                  category: 'other',
                  customCategory: text
                }));
              }}
              placeholder={t.category.customPlaceholder || "Enter custom category"}
              style={styles.input}
              theme={{ colors: { primary: '#E8E8E8' } }}
              underlineColor="#E8E8E8"
            />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: value,
                    subcategory: value ? getSubcategoryKeys(value)[0] || '' : '',
                    customCategory: '',
                    customSubcategory: ''
                  }));
                  setCustomCategory('');
                  setCustomSubcategory('');
                }}
                style={styles.picker}
              >
                <Picker.Item label={t.category.placeholder} value="" />
                {categoryKeys.map((key) => (
                  <Picker.Item 
                    key={key} 
                    label={t.category.options[key]} 
                    value={key} 
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <View style={styles.categoryBox}>
          <Text style={styles.label}>{t.subcategory.label}</Text>
          {formData.category === 'other' ? (
            <TextInput
              mode="flat"
              value={customSubcategory}
              onChangeText={(text) => {
                setCustomSubcategory(text);
                setFormData(prev => ({ 
                  ...prev, 
                  subcategory: 'other',
                  customSubcategory: text
                }));
              }}
              placeholder={t.subcategory.customPlaceholder || "Enter custom subcategory"}
              style={styles.input}
              theme={{ colors: { primary: '#E8E8E8' } }}
              underlineColor="#E8E8E8"
            />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.subcategory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                style={styles.picker}
                enabled={formData.category !== ''}
              >
                <Picker.Item label={t.subcategory.placeholder} value="" />
                {formData.category && getSubcategoryKeys(formData.category).map((key) => (
                  <Picker.Item 
                    key={key} 
                    label={t.category.subcategories[formData.category][key]} 
                    value={key} 
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.images.label}</Text>
      
      <TouchableOpacity style={styles.imageUpload} onPress={handleImageSource}>
        <Ionicons name="cloud-upload-outline" size={48} color="#6C63FF" />
        <Text style={styles.imageUploadText}>{t.images.add}</Text>
        <Text style={[styles.imageUploadText, { fontSize: 14 }]}>{t.images.max}</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  const newImages = [...images];
                  newImages.splice(index, 1);
                  setImages(newImages);
                  setFormData(prev => ({
                    ...prev,
                    images: newImages.map(img => img.uri)
                  }));
                }}
              >
                <Ionicons name="close-circle" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.pricing.title}</Text>

      <View style={styles.priceContainer}>
        <View style={styles.priceBox}>
          <Text style={styles.label}>{t.pricing.mrp.label}</Text>
          <TextInput
            mode="flat"
            value={formData.minPrice}
            onChangeText={(text) => setFormData(prev => ({ ...prev, minPrice: text }))}
            keyboardType="numeric"
            placeholder={t.pricing.mrp.placeholder}
            style={[styles.input, styles.priceInput]}
            theme={{ colors: { primary: '#E8E8E8' } }}
            underlineColor="#E8E8E8"
          />
        </View>

        <View style={styles.priceSeparator}>
          <Text style={styles.priceSeparatorText}>-</Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.label}>{t.pricing.sellingPrice.label}</Text>
          <TextInput
            mode="flat"
            value={formData.maxPrice}
            onChangeText={(text) => setFormData(prev => ({ ...prev, maxPrice: text }))}
            keyboardType="numeric"
            placeholder={t.pricing.sellingPrice.placeholder}
            style={[styles.input, styles.priceInput]}
            theme={{ colors: { primary: '#E8E8E8' } }}
            underlineColor="#E8E8E8"
          />
        </View>
      </View>

      <View style={styles.unitContainer}>
        <View style={styles.unitBox}>
          <Text style={styles.label}>{t.unit.label}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.unitType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, unitType: value }))}
              style={styles.picker}
            >
              {unitTypes.map((type) => (
                <Picker.Item key={type.value} label={t.unit.types[type.value]} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.unitBox}>
          <Text style={styles.label}>{t.pricing.minQuantity.label}</Text>
          <TextInput
            mode="flat"
            value={formData.unitPrice}
            onChangeText={(text) => setFormData(prev => ({ ...prev, unitPrice: text }))}
            keyboardType="numeric"
            placeholder={t.pricing.minQuantity.placeholder}
            style={styles.input}
            theme={{ colors: { primary: '#E8E8E8' } }}
            underlineColor="#E8E8E8"
          />
        </View>
      </View>

      <View style={styles.stockContainer}>
        <View style={styles.stockBox}>
          <Text style={styles.label}>{t.stock.label}</Text>
          <TextInput
            mode="flat"
            value={formData.totalStock}
            onChangeText={(text) => setFormData(prev => ({ ...prev, totalStock: text }))}
            keyboardType="numeric"
            placeholder={t.stock.placeholder}
            style={styles.input}
            theme={{ colors: { primary: '#E8E8E8' } }}
            underlineColor="#E8E8E8"
          />
        </View>
      </View>

      <View style={styles.auctionContainer}>
        <Text style={styles.label}>नीलामी समाप्ति तिथि</Text>
        <TextInput
          mode="flat"
          value={formData.auctionEndDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, auctionEndDate: text }))}
          placeholder="DD/MM/YYYY"
          style={styles.input}
          theme={{ colors: { primary: '#E8E8E8' } }}
          underlineColor="#E8E8E8"
        />
        <Text style={styles.helperText}>कृपया DD/MM/YYYY फॉर्मेट में तारीख दर्ज करें</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
      </View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View 
            key={s} 
            style={[
              styles.stepDot,
              s === step && styles.stepDotActive,
              s < step && styles.stepDotCompleted
            ]} 
          />
        ))}
      </View>

      <View style={styles.form}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {step === 3 ? t.buttons.submit : t.buttons.next}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.validation.required}</Text>
            
            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationLabel}>{t.productName.label}</Text>
              <Text style={styles.confirmationValue}>{formData.name}</Text>
            </View>

            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationLabel}>{t.pricing.title}</Text>
              <Text style={styles.confirmationValue}>₹{formData.minPrice} - ₹{formData.maxPrice}</Text>
            </View>

            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationLabel}>{t.unit.label}</Text>
              <Text style={styles.confirmationValue}>₹{formData.unitPrice}/{formData.unitType}</Text>
            </View>

            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationLabel}>{t.stock.label}</Text>
              <Text style={styles.confirmationValue}>{formData.totalStock} {formData.unitType}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{t.buttons.submit}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.imageModal.title}</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={async () => {
                setShowImageSourceModal(false);
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status === 'granted') {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                  });
                  if (!result.canceled) {
                    setImages([...images, result.assets[0]]);
                  }
                }
              }}
            >
              <Ionicons name="camera" size={24} color="#6C63FF" />
              <Text style={styles.modalOptionText}>{t.imageModal.camera}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setShowImageSourceModal(false);
                pickImage();
              }}
            >
              <Ionicons name="images" size={24} color="#6C63FF" />
              <Text style={styles.modalOptionText}>{t.imageModal.gallery}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={styles.cancelOptionText}>{t.imageModal.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#6C63FF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  form: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    height: 50,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 4,
  },
  picker: {
    height: 50,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  uploadedImagesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  addMoreButtonText: {
    color: '#6C63FF',
    marginLeft: 8,
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  negotiationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8E8E8',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#6C63FF',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  cancelOption: {
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelOptionText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#666',
  },
  confirmationValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#6C63FF',
  },
  modalButtonSecondary: {
    backgroundColor: '#F8F9FA',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  categoryBox: {
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  priceBox: {
    flex: 1,
  },
  priceSeparator: {
    paddingBottom: 15,
  },
  priceSeparatorText: {
    fontSize: 16,
    color: '#666',
  },
  unitContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  unitBox: {
    flex: 1,
  },
  stockContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  stockBox: {
    flex: 1,
  },
  imageNumber: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFFFFF',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  removeImageButtonInner: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenPreview: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closePreviewButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  auctionContainer: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default AddB2BProduct;
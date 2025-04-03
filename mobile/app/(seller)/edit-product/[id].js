import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../../src/config/axios';
import { Picker } from '@react-native-picker/picker';
import { useLanguage } from '../../../src/context/LanguageContext';
import { translations } from '../../../src/translations/addProduct';

const categories = [
  'Home-Made',
  'Organic Vegetables & Fruits',
  'Handmade Pottery & Cookware',
  'Microgreens & Herbs',
  'Natural & Handmade Soaps',
  'Preservative-Free Pickles',
  'Pure Honey & Natural Sweeteners',
  'Handmade Beauty & Wellness Products',
  'Eco-Friendly & Recycled Products',
  'Creative & Artistic Products'
];

const unitTypes = [
  { label: 'Kilogram', value: 'kg' },
  { label: 'Gram', value: 'g' },
  { label: 'Piece', value: 'piece' },
  { label: 'Thali', value: 'thali' },
  { label: 'Pack', value: 'pack' },
  { label: 'Jar', value: 'jar' },
  { label: 'Bottle', value: 'bottle' },
  { label: 'Packet', value: 'pkt' },
  { label: 'Set', value: 'set' },
  { label: 'Box', value: 'box' }
];

const EditProductScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    tags: [],
    youtubeLink: '',
    platformType: ['b2c'],
    unitSize: '1',
    unitType: 'kg',
    subUnitPrices: {
      '250g': '',
      '500g': '',
    }
  });
  const [currentTag, setCurrentTag] = useState('');
  const [tagInputRef, setTagInputRef] = useState(null);
  const [youtubeThumb, setYoutubeThumb] = useState(null);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showSubcategorySuggestions, setShowSubcategorySuggestions] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      if (response.data?.success) {
        const productData = {
          ...response.data.product,
          price: String(response.data.product.price),
          stock: String(response.data.product.stock),
          unitSize: String(response.data.product.unitSize || '1'),
          subUnitPrices: response.data.product.subUnitPrices || {
            '250g': '',
            '500g': '',
          }
        };
        setFormData(productData);
        
        if (productData.youtubeLink) {
          const videoId = getYoutubeVideoId(productData.youtubeLink);
          if (videoId) {
            setYoutubeThumb(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
          }
        }
      } else {
        Alert.alert('Error', 'Problem loading product information');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Problem loading product information');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
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
          const uploadResponse = await axios.post('/api/upload/firebase', {
            file: result.assets[0].base64,
            path: `product-images/${id}-${Date.now()}.jpg`,
          });

          if (uploadResponse.data?.success && uploadResponse.data?.url) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, uploadResponse.data.url]
            }));
          } else {
            throw new Error('Failed to upload photo');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', 'Problem uploading photo');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Problem selecting photo');
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateSubUnitPrices = (mainPrice, mainUnit) => {
    if (mainUnit === 'kg' && mainPrice) {
      const pricePerGram = parseFloat(mainPrice) / 1000;
      const prices = {
        '250g': (pricePerGram * 250).toFixed(2),
        '500g': (pricePerGram * 500).toFixed(2)
      };
      setFormData(prev => ({
        ...prev,
        subUnitPrices: prices
      }));
    }
  };

  const validateYoutubeUrl = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeLink = (text) => {
    setFormData(prev => ({ ...prev, youtubeLink: text }));
    if (validateYoutubeUrl(text)) {
      const videoId = getYoutubeVideoId(text);
      if (videoId) {
        setYoutubeThumb(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      } else {
        setYoutubeThumb(null);
      }
    } else {
      setYoutubeThumb(null);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name) {
          Alert.alert('Error', 'Please enter product name');
          return false;
        }
        if (!formData.category) {
          Alert.alert('Error', 'Please select category');
          return false;
        }
        return true;
      case 2:
        if (formData.images.length === 0) {
          Alert.alert('Error', 'Please select at least one photo');
          return false;
        }
        if (formData.youtubeLink && !validateYoutubeUrl(formData.youtubeLink)) {
          Alert.alert('Error', 'Please enter a valid YouTube link');
          return false;
        }
        if (formData.youtubeLink && formData.images.length > 4) {
          Alert.alert('Error', 'Maximum 4 photos can be uploaded with a YouTube video');
          return false;
        }
        if (!formData.youtubeLink && formData.images.length > 5) {
          Alert.alert('Error', 'Maximum 5 photos can be uploaded');
          return false;
        }
        return true;
      case 3:
        if (!formData.price || !formData.unitType) {
          Alert.alert('Error', 'Please enter price and unit type');
          return false;
        }
        if (!formData.stock) {
          Alert.alert('Error', 'Please enter stock');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 4) {
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

  const handleUpdateProduct = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        stock: parseInt(formData.stock),
        images: formData.images || [],
        youtubeLink: formData.youtubeLink || '',
        unitSize: parseFloat(formData.unitSize),
        unitType: formData.unitType,
        subUnitPrices: formData.subUnitPrices || {},
        availableLocations: formData.availableLocations || []
      };

      console.log('Updating product with data:', updateData);

      const response = await axios.put(`/api/products/${id}`, updateData);

      if (response.data?.success) {
        Alert.alert(
          'Success',
          'Product updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                if (router.canGoBack()) {
                  // First navigate back to product page
                  router.back();
                  
                  // Then force a reload by replacing the current route
                  router.replace(`/(seller)/product-details/${id}`);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Problem updating product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', error.response?.data?.message || 'Problem updating product');
    } finally {
      setSaving(false);
      setShowConfirmation(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim()) {
      const newTag = currentTag.trim().startsWith('#') ? currentTag.trim() : `#${currentTag.trim()}`;
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setCurrentTag('');
      tagInputRef?.clear();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getSubcategories = (category) => {
    const subcategories = {
      'Home-Made': ['Namkeen', 'Sweets', 'Cakes', 'Papad'],
      'Organic Vegetables & Fruits': ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables'],
      'Handmade Pottery & Cookware': ['Pots', 'Pans', 'Plates', 'Bowls'],
      'Microgreens & Herbs': ['Microgreens', 'Herbs', 'Sprouts'],
      'Natural & Handmade Soaps': ['Body Soaps', 'Face Soaps', 'Handmade Soaps'],
      'Preservative-Free Pickles': ['Vegetable Pickles', 'Fruit Pickles', 'Mixed Pickles'],
      'Pure Honey & Natural Sweeteners': ['Honey', 'Jaggery', 'Natural Syrups'],
      'Handmade Beauty & Wellness Products': ['Skincare', 'Haircare', 'Wellness'],
      'Eco-Friendly & Recycled Products': ['Home Decor', 'Accessories', 'Stationery'],
      'Creative & Artistic Products': ['Art', 'Crafts', 'Decor']
    };
    return subcategories[category] || [];
  };

  const getCategoryLabel = (category) => {
    const categoryTranslations = {
      'Home-Made': {
        en: 'Home-Made',
        hi: 'घरेलू',
        mr: 'घरगुती',
        gu: 'ઘરેલું'
      },
      'Organic Vegetables & Fruits': {
        en: 'Organic Vegetables & Fruits',
        hi: 'जैविक सब्जियां और फल',
        mr: 'जैविक भाजी आणि फळे',
        gu: 'જૈવિક શાકભાજી અને ફળો'
      }
      // ... existing translations ...
    };
    return categoryTranslations[category]?.[language] || category;
  };

  const getSubcategoryLabel = (subcategory) => {
    const subcategoryTranslations = {
      'Namkeen': {
        en: 'Namkeen',
        hi: 'नमकीन',
        mr: 'नमकीन',
        gu: 'નમકીન'
      },
      'Sweets': {
        en: 'Sweets',
        hi: 'मिठाई',
        mr: 'मिठाई',
        gu: 'મીઠાઈ'
      },
      'Cakes': {
        en: 'Cakes',
        hi: 'केक',
        mr: 'केक',
        gu: 'કેક'
      },
      'Papad': {
        en: 'Papad',
        hi: 'पापड़',
        mr: 'पापड',
        gu: 'પાપડ'
      }
      // ... existing translations ...
    };
    return subcategoryTranslations[subcategory]?.[language] || subcategory;
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 1: Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter product name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          <TextInput
            style={styles.input}
            value={formData.category}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, category: text }));
              setShowCategorySuggestions(true);
            }}
            onFocus={() => setShowCategorySuggestions(true)}
            placeholder="Select Category or type"
          />
          
          {showCategorySuggestions && (
            <View style={styles.suggestionsDropdown}>
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.suggestionItem,
                      formData.category === category && styles.suggestionItemSelected
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, category }));
                      setShowCategorySuggestions(false);
                    }}
                  >
                    <Text style={[
                      styles.suggestionText,
                      formData.category === category && styles.suggestionTextSelected
                    ]}>
                      {getCategoryLabel(category)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subcategory *</Text>
        <View style={styles.subcategoryContainer}>
          <TextInput
            style={styles.input}
            value={formData.subcategory}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, subcategory: text }));
              if (text.length === 0) {
                setShowSubcategorySuggestions(true);
              } else {
                setShowSubcategorySuggestions(false);
              }
            }}
            onFocus={() => {
              if (!formData.subcategory) {
                setShowSubcategorySuggestions(true);
              }
            }}
            placeholder="Select Subcategory or type"
          />

          {showSubcategorySuggestions && formData.category && (
            <View style={styles.suggestionsDropdown}>
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
                {getSubcategories(formData.category).map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory}
                    style={[
                      styles.suggestionItem,
                      formData.subcategory === subcategory && styles.suggestionItemSelected
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, subcategory }));
                      setShowSubcategorySuggestions(false);
                    }}
                  >
                    <Text style={[
                      styles.suggestionText,
                      formData.subcategory === subcategory && styles.suggestionTextSelected
                    ]}>
                      {getSubcategoryLabel(subcategory)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Write product description"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 2: Photos and Media</Text>
      <Text style={styles.stepDescription}>
        {formData.youtubeLink 
          ? 'Maximum 4 photos and 1 YouTube video can be uploaded'
          : 'Maximum 5 photos can be uploaded'}
      </Text>
      
      <View style={styles.imageSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
        >
          {formData.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.productImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#E53E3E" />
              </TouchableOpacity>
            </View>
          ))}
          {((formData.youtubeLink && formData.images.length < 4) || 
            (!formData.youtubeLink && formData.images.length < 5)) && (
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={handleImagePick}
              disabled={imageLoading}
            >
              {imageLoading ? (
                <ActivityIndicator size="small" color="#6C63FF" />
              ) : (
                <>
                  <Ionicons name="camera" size={32} color="#6C63FF" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>YouTube Link (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.youtubeLink}
          onChangeText={handleYoutubeLink}
          placeholder="https://youtube.com/..."
        />
        {youtubeThumb && (
          <View style={styles.youtubeThumbContainer}>
            <Image 
              source={{ uri: youtubeThumb }} 
              style={styles.youtubeThumb}
            />
            <View style={styles.youtubePlayIcon}>
              <Ionicons name="logo-youtube" size={30} color="#FF0000" />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 3: Price and Stock</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Unit Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.unitType}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, unitType: value }));
              calculateSubUnitPrices(formData.price, value);
            }}
            style={styles.picker}
          >
            {unitTypes.map((type) => (
              <Picker.Item 
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Main Price (₹) *</Text>
        <View style={styles.priceContainer}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            value={formData.price}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, price: text }));
              calculateSubUnitPrices(text, formData.unitType);
            }}
            keyboardType="numeric"
            placeholder="Enter price"
          />
          <Text style={styles.priceUnit}>₹ / {unitTypes.find(t => t.value === formData.unitType)?.label || formData.unitType}</Text>
        </View>
      </View>

      {formData.unitType === 'kg' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price for other quantities:</Text>
          <View style={styles.otherQuantities}>
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>250g:</Text>
              <Text style={styles.quantityPrice}>₹{(parseFloat(formData.price) / 4).toFixed(2)}</Text>
            </View>
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>500g:</Text>
              <Text style={styles.quantityPrice}>₹{(parseFloat(formData.price) / 2).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Stock *</Text>
        <TextInput
          style={styles.input}
          value={formData.stock}
          onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
          keyboardType="numeric"
          placeholder="Enter available stock"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Step 4: Preview</Text>
      
      <View style={styles.previewCard}>
        {formData.images.length > 0 && (
          <Image 
            source={{ uri: formData.images[0] }} 
            style={styles.previewImage}
          />
        )}
        
        <View style={styles.previewContent}>
          <Text style={styles.previewName}>{formData.name}</Text>
          <Text style={styles.previewPrice}>₹{formData.price}/{formData.unitType}</Text>
          <Text style={styles.previewStock}>Stock: {formData.stock} {formData.unitType}</Text>
          <Text style={styles.previewCategory}>{formData.category}</Text>
          
          {formData.description && (
            <Text style={styles.previewDescription}>{formData.description}</Text>
          )}

          {formData.tags.length > 0 && (
            <View style={styles.previewTags}>
              {formData.tags.map((tag, index) => (
                <Text key={index} style={styles.previewTag}>{tag}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderConfirmationModal = () => (
    <Modal
      visible={showConfirmation}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Verify Product Information</Text>
          
          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>Product:</Text>
            <Text style={styles.confirmationValue}>{formData.name}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>Price:</Text>
            <Text style={styles.confirmationValue}>₹{formData.price} per {formData.unitSize} {formData.unitType}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>Category:</Text>
            <Text style={styles.confirmationValue}>{formData.category}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>Stock:</Text>
            <Text style={styles.confirmationValue}>{formData.stock} {formData.unitType}</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowConfirmation(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleUpdateProduct}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading product information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Product</Text>
      </View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((s) => (
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
        {step === 4 && renderStep4()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleNext}
            disabled={saving}
          >
            <Text style={styles.submitButtonText}>
              {step === 4 ? 'Review' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderConfirmationModal()}
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
  headerButton: {
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
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  form: {
    padding: 16,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryChipSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  imageSection: {
    marginBottom: 24,
  },
  imageGallery: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  addImageText: {
    color: '#6C63FF',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
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
    minHeight: '50%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: '#6C63FF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A5568',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginRight: 8,
  },
  addTagButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    color: '#6C63FF',
    marginRight: 4,
    fontSize: 14,
  },
  tagRemoveButton: {
    marginLeft: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  youtubeThumbContainer: {
    marginTop: 12,
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  youtubeThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  youtubePlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
  },
  priceInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    paddingRight: 70,
  },
  unitTypeLabelInside: {
    position: 'absolute',
    right: 16,
    color: '#666',
    fontSize: 16,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewContent: {
    padding: 16,
  },
  previewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewPrice: {
    fontSize: 18,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 8,
  },
  previewStock: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  previewCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  previewTag: {
    fontSize: 12,
    color: '#6C63FF',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  unitLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  otherQuantities: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#333',
  },
  quantityPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryContainer: {
    position: 'relative',
  },
  subcategoryContainer: {
    position: 'relative',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  suggestionItemSelected: {
    backgroundColor: '#F0F0FF',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionTextSelected: {
    color: '#6C63FF',
    fontWeight: '500',
  },
});

export default EditProductScreen; 
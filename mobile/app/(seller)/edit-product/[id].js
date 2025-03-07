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
import { sellerApi } from '../../../src/api/sellerApi';
import axios from '../../../src/config/axios';
import { Picker } from '@react-native-picker/picker';

const categories = [
  'Homemade Snacks',
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
  { label: 'किलोग्राम', value: 'kg' },
  { label: 'ग्राम', value: 'g' },
  { label: 'पीस', value: 'piece' },
  { label: 'थाली', value: 'thali' },
  { label: 'पैक', value: 'pack' },
  { label: 'जार', value: 'jar' },
  { label: 'बोतल', value: 'bottle' },
  { label: 'पैकेट', value: 'pkt' },
  { label: 'सेट', value: 'set' },
  { label: 'बॉक्स', value: 'box' }
];

const EditProductScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await sellerApi.getProductDetails(id);
      if (response.success) {
        const productData = {
          ...response.product,
          price: String(response.product.price),
          stock: String(response.product.stock),
          unitSize: String(response.product.unitSize || '1'),
          subUnitPrices: response.product.subUnitPrices || {
            '250g': '',
            '500g': '',
          }
        };
        setFormData(productData);
        
        // Set YouTube thumbnail if link exists
        if (productData.youtubeLink) {
          const videoId = getYoutubeVideoId(productData.youtubeLink);
          if (videoId) {
            setYoutubeThumb(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
          }
        }
      } else {
        Alert.alert('एरर', 'प्रोडक्ट की जानकारी लोड करने में समस्या हुई');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('एरर', 'प्रोडक्ट की जानकारी लोड करने में समस्या हुई');
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
            throw new Error('फोटो अपलोड नहीं हो सका');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('एरर', 'फोटो अपलोड करने में समस्या हुई');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('एरर', 'फोटो चुनने में समस्या हुई');
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
      setFormData(prev => ({
        ...prev,
        subUnitPrices: {
          '250g': (pricePerGram * 250).toFixed(2),
          '500g': (pricePerGram * 500).toFixed(2)
        }
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
          Alert.alert('ज़रूरी', 'कृपया प्रोडक्ट का नाम भरें');
          return false;
        }
        if (!formData.category) {
          Alert.alert('ज़रूरी', 'कृपया श्रेणी चुनें');
          return false;
        }
        return true;
      case 2:
        if (formData.images.length === 0) {
          Alert.alert('ज़रूरी', 'कम से कम एक फोटो चुनें');
          return false;
        }
        if (formData.youtubeLink && !validateYoutubeUrl(formData.youtubeLink)) {
          Alert.alert('एरर', 'कृपया सही यूट्यूब लिंक डालें');
          return false;
        }
        if (formData.youtubeLink && formData.images.length > 4) {
          Alert.alert('एरर', 'यूट्यूब वीडियो के साथ अधिकतम 4 फोटो अपलोड कर सकते हैं');
          return false;
        }
        if (!formData.youtubeLink && formData.images.length > 5) {
          Alert.alert('एरर', 'अधिकतम 5 फोटो अपलोड कर सकते हैं');
          return false;
        }
        return true;
      case 3:
        if (!formData.price || !formData.unitType) {
          Alert.alert('ज़रूरी', 'कृपया कीमत और यूनिट टाइप भरें');
          return false;
        }
        if (!formData.stock) {
          Alert.alert('ज़रूरी', 'कृपया स्टॉक की मात्रा भरें');
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
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unitSize: parseFloat(formData.unitSize),
        subUnitPrices: Object.fromEntries(
          Object.entries(formData.subUnitPrices).filter(([_, value]) => value !== '')
        )
      };

      const response = await axios.put(`/api/seller/products/${id}`, productData);

      if (response.data?.success) {
        Alert.alert(
          'सफल',
          'प्रोडक्ट अपडेट हो गया है',
          [
            {
              text: 'ठीक है',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back({
                    params: {
                      shouldRefresh: true
                    }
                  });
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('एरर', 'प्रोडक्ट अपडेट करने में समस्या हुई');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('एरर', 'प्रोडक्ट अपडेट करने में समस्या हुई');
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

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>चरण 1: बेसिक जानकारी</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>प्रोडक्ट का नाम *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="उदाहरण: मसाला डोसा"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>श्रेणी चुनें *</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                formData.category === category && styles.categoryChipSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, category }))}
            >
              <Text 
                style={[
                  styles.categoryChipText,
                  formData.category === category && styles.categoryChipTextSelected
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>विवरण</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="प्रोडक्ट का विवरण लिखें"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>टैग्स (वैकल्पिक)</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            ref={ref => setTagInputRef(ref)}
            style={styles.tagInput}
            value={currentTag}
            onChangeText={setCurrentTag}
            placeholder="#टमाटर"
            onSubmitEditing={handleAddTag}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addTagButton} 
            onPress={handleAddTag}
          >
            <Ionicons name="add-circle" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tagsContainer}>
          {formData.tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tagChip}
              onPress={() => handleRemoveTag(tag)}
            >
              <Text style={styles.tagChipText}>{tag}</Text>
              <View style={styles.tagRemoveButton}>
                <Ionicons name="close-circle" size={20} color="#FF4444" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>चरण 2: फोटो और मीडिया</Text>
      <Text style={styles.stepDescription}>
        {formData.youtubeLink 
          ? 'अधिकतम 4 फोटो और 1 यूट्यूब वीडियो अपलोड कर सकते हैं'
          : 'अधिकतम 5 फोटो अपलोड कर सकते हैं'}
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
                  <Text style={styles.addImageText}>फोटो जोड़ें</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>यूट्यूब लिंक (वैकल्पिक)</Text>
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
      <Text style={styles.stepTitle}>चरण 3: कीमत और स्टॉक</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>यूनिट टाइप *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.unitType}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, unitType: value }));
              calculateSubUnitPrices(formData.price, value);
            }}
            style={styles.picker}
          >
            {unitTypes.map(unit => (
              <Picker.Item 
                key={unit.value}
                label={unit.label} 
                value={unit.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>मुख्य कीमत (₹) *</Text>
        <View style={styles.priceInputWrapper}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            value={formData.price}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, price: text }));
              calculateSubUnitPrices(text, formData.unitType);
            }}
            keyboardType="numeric"
            placeholder="प्रति किलोग्राम की कीमत"
          />
          <Text style={styles.unitTypeLabelInside}>₹/{formData.unitType}</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>स्टॉक *</Text>
        <TextInput
          style={styles.input}
          value={formData.stock}
          onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
          keyboardType="numeric"
          placeholder="कितने kg उपलब्ध है"
        />
      </View>

      {formData.unitType === 'kg' && (
        <View>
          <Text style={styles.subtitle}>छोटी मात्रा की कीमत</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>250g की कीमत</Text>
              <TextInput
                style={styles.input}
                value={formData.subUnitPrices['250g']}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  subUnitPrices: { ...prev.subUnitPrices, '250g': text }
                }))}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>500g की कीमत</Text>
              <TextInput
                style={styles.input}
                value={formData.subUnitPrices['500g']}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  subUnitPrices: { ...prev.subUnitPrices, '500g': text }
                }))}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>चरण 4: प्रीव्यू</Text>
      
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
          <Text style={styles.previewStock}>स्टॉक: {formData.stock} {formData.unitType}</Text>
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
          <Text style={styles.modalTitle}>प्रोडक्ट की जानकारी जाँच लें</Text>
          
          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>प्रोडक्ट:</Text>
            <Text style={styles.confirmationValue}>{formData.name}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>कीमत:</Text>
            <Text style={styles.confirmationValue}>₹{formData.price} प्रति {formData.unitSize} {formData.unitType}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>श्रेणी:</Text>
            <Text style={styles.confirmationValue}>{formData.category}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>स्टॉक:</Text>
            <Text style={styles.confirmationValue}>{formData.stock} {formData.unitType}</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowConfirmation(false)}
            >
              <Text style={styles.cancelButtonText}>वापस जाएं</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleUpdateProduct}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmButtonText}>अपडेट करें</Text>
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
        <Text style={styles.loadingText}>प्रोडक्ट की जानकारी लोड हो रही है...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>प्रोडक्ट अपडेट करें</Text>
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
              {step === 4 ? 'समीक्षा करें' : 'अगला'}
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
    marginRight: 8,
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
});

export default EditProductScreen; 
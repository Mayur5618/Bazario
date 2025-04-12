import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from '../../src/config/axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import * as Camera from 'expo-camera';
import { useLanguage } from '../../src/context/LanguageContext';
import { translations } from '../../src/translations/addProduct';
import { useAuth } from '../../src/context/AuthContext';

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
  'Creative & Artistic Products',
  'Ready to Eat',
  'Accessories',
  'Other'
];

const getSubcategories = (category) => {
  const subcategories = {
    'Home-Made': ['Namkeen', 'Sweets','Cakes','Papad'],
    'Organic Vegetables & Fruits': ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables'],
    'Handmade Pottery & Cookware': ['Pots', 'Pans', 'Plates', 'Bowls'],
    'Microgreens & Herbs': ['Microgreens', 'Herbs', 'Sprouts'],
    'Natural & Handmade Soaps': ['Body Soaps', 'Face Soaps', 'Handmade Soaps'],
    'Preservative-Free Pickles': ['Vegetable Pickles', 'Fruit Pickles', 'Mixed Pickles'],
    'Pure Honey & Natural Sweeteners': ['Honey', 'Jaggery', 'Natural Syrups'],
    'Handmade Beauty & Wellness Products': ['Skincare', 'Haircare', 'Wellness'],
    'Eco-Friendly & Recycled Products': ['Home Decor', 'Accessories', 'Stationery'],
    'Creative & Artistic Products': ['Art', 'Crafts', 'Decor'],
    'Ready to Eat': ['Thali-Special', 'Dal-Bati-Churma', 'Pasta', 'Other'],
    'Accessories': ['Trendy touches', 'Grooming', 'Jewelry', 'Other']
    // 'Other': []
  };
  return subcategories[category] || [];
};

const unitTypes = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'piece', label: 'piece' },
  { value: 'thali', label: 'thali' },
  { value: 'pack', label: 'pack' },
  { value: 'jar', label: 'jar' },
  { value: 'bottle', label: 'bottle' },
  { value: 'pkt', label: 'pkt' },
  { value: 'set', label: 'set' },
  { value: 'box', label: 'box' }
];

const AddProductScreen = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language] || translations.en;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
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
    },
    availableLocations: []
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [cameraPermission, setCameraPermission] = useState(null);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [selectedImageSource, setSelectedImageSource] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [youtubeThumb, setYoutubeThumb] = useState(null);
  const [tagInputRef, setTagInputRef] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationInputRef, setLocationInputRef] = useState(null);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [showCustomSubcategoryInput, setShowCustomSubcategoryInput] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState('');
  const [showSubcategorySuggestions, setShowSubcategorySuggestions] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    console.log('User data in useEffect:', user); // Debug log
    if (user) {
      const category = user.businessType === 'Other' ? user.customBusinessType : user.businessType;
      setFormData(prev => ({
        ...prev,
        category: category || ''
      }));
    }
  }, [user]);

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

  const handleImageSource = () => {
    setShowImageSourceModal(true);
  };

  const takePhoto = async () => {
    if (!cameraPermission) {
      Alert.alert('कैमरा की अनुमति नहीं है', 'कृपया सेटिंग्स में जाकर कैमरा की अनुमति दें');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        handleImageResult([result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('एरर', 'फोटो लेने में समस्या हुई');
    }
    setShowImageSourceModal(false);
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: formData.youtubeLink ? 4 : 5,
      });

      if (!result.canceled) {
        handleImageResult(result.assets);
      }
    } catch (error) {
      Alert.alert('एरर', 'फोटो चुनने में समस्या हुई');
    }
    setShowImageSourceModal(false);
  };

  const handleImageResult = async (assets) => {
    const maxImages = formData.youtubeLink ? 4 : 5;
    if (selectedImages.length + assets.length > maxImages) {
      Alert.alert(
        'ध्यान दें',
        `आप केवल ${maxImages} ${formData.youtubeLink ? '(यूट्यूब लिंक के साथ 4 फोटो)' : ''} फोटो चुन सकते हैं`
      );
      return;
    }

    const newImages = [...selectedImages, ...assets];
    setSelectedImages(newImages);
    setFormData(prev => ({
      ...prev,
      images: newImages.map(asset => asset.uri)
    }));

    // AI से category suggest करें
    if (formData.name) {
      try {
        setLoading(true);
        const response = await axios.post('/api/ai/suggest-category', {
          productName: formData.name,
          images: newImages.map(asset => asset.uri)
        });
        if (response.data.category) {
          setSuggestedCategory(response.data.category);
          setFormData(prev => ({ ...prev, category: response.data.category }));
          Alert.alert('सुझाव', `हमें लगता है कि यह ${response.data.category} श्रेणी का प्रोडक्ट है`);
        }
      } catch (error) {
        console.log('Category suggestion failed:', error);
      } finally {
        setLoading(false);
      }
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
      if (tagInputRef) {
        tagInputRef.focus();
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
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
        if (result.assets.length > 5) {
          Alert.alert('ध्यान दें', 'आप केवल 5 फोटो चुन सकते हैं');
          return;
        }
        setSelectedImages(result.assets);
        setFormData(prev => ({
          ...prev,
          images: result.assets.map(asset => asset.uri)
        }));

        // AI से category suggest करें
        try {
          setLoading(true);
          const response = await axios.post('/api/ai/suggest-category', {
            productName: formData.name,
            images: result.assets.map(asset => asset.uri)
          });
          if (response.data.category) {
            setSuggestedCategory(response.data.category);
            setFormData(prev => ({ ...prev, category: response.data.category }));
            Alert.alert('सुझाव', `हमें लगता है कि यह ${response.data.category} श्रेणी का प्रोडक्ट है`);
          }
        } catch (error) {
          console.log('Category suggestion failed:', error);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('एरर', 'फोटो चुनने में समस्या हुई');
    }
  };

  const handleAddLocation = () => {
    if (currentLocation.trim()) {
      const newLocation = currentLocation.trim();
      if (!formData.availableLocations.includes(newLocation)) {
        setFormData(prev => ({
          ...prev,
          availableLocations: [...prev.availableLocations, newLocation]
        }));
      }
      setCurrentLocation('');
      if (locationInputRef) {
        locationInputRef.focus();
      }
    }
  };

  const handleRemoveLocation = (locationToRemove) => {
    setFormData(prev => ({
      ...prev,
      availableLocations: prev.availableLocations.filter(loc => loc !== locationToRemove)
    }));
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
        if (!formData.subcategory) {
          Alert.alert('ज़रूरी', 'कृपया उपश्रेणी दर्ज करें');
          return false;
        }
        return true;
      case 2:
        if (selectedImages.length === 0) {
          Alert.alert('ज़रूरी', 'कम से कम एक फोटो चुनें');
          return false;
        }
        if (formData.youtubeLink && !validateYoutubeUrl(formData.youtubeLink)) {
          Alert.alert('गलत लिंक', 'कृपया सही यूट्यूब लिंक डालें');
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
        if (formData.availableLocations.length === 0) {
          Alert.alert('ज़रूरी', 'कृपया कम से कम एक शहर चुनें जहाँ प्रोडक्ट उपलब्ध होगा');
          return false;
        }
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

  const handleSubmit = async () => {
    if (!formData.subcategory) {
      Alert.alert('एरर', 'कृपया उपश्रेणी दर्ज करें');
      setStep(1); // Go back to step 1 where subcategory input is
      return;
    }

    setLoading(true);
    try {
      console.log('Starting product submission...');
      console.log('Available Locations:', formData.availableLocations); // Debug log
      // Upload images first
      const imageUrls = await Promise.all(
        selectedImages.map(async (image, index) => {
          console.log(`Processing image ${index + 1}...`);
          // Convert image to base64
          const response = await fetch(image.uri);
          const blob = await response.blob();
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          console.log(`Uploading image ${index + 1} to server...`);
          // Upload to server
          const uploadResponse = await axios.post('/api/products/upload', {
            image: base64Data
          });
          
          console.log(`Image ${index + 1} upload response:`, uploadResponse.data);
          
          if (!uploadResponse.data.success) {
            throw new Error(uploadResponse.data.message || 'Image upload failed');
          }
          
          return uploadResponse.data.url;
        })
      );

      console.log('All images uploaded successfully:', imageUrls);

      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description || '',
        price: Number(formData.price),
        category: getDisplayCategory() || 'General Products',
        subcategory: formData.subcategory, // Adding subcategory field
        stock: Number(formData.stock),
        images: imageUrls,
        tags: formData.tags,
        youtubeLink: formData.youtubeLink || '',
        platformType: ['b2c'],
        unitSize: Number(formData.unitSize) || 1,
        unitType: formData.unitType,
        subUnitPrices: formData.subUnitPrices || {},
        availableLocations: formData.availableLocations
      };

      console.log('Product data being sent:', productData); // Debug log

      const response = await axios.post('/api/products/create', productData);
      console.log('Product creation response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'सफल', 
          'प्रोडक्ट सफलतापूर्वक जोड़ा गया', 
          [
            {
              text: 'ठीक है',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error(response.data.message || 'कुछ गलत हो गया');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert(
        'एरर',
        error.response?.data?.message || 
        error.message || 
        'प्रोडक्ट जोड़ने में समस्या हुई'
      );
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeLink = (text) => {
    if (text && !validateYoutubeUrl(text)) {
      Alert.alert('गलत लिंक', 'कृपया सही यूट्यूब लिंक डालें');
      return;
    }
    if (text && selectedImages.length > 4) {
      Alert.alert('ध्यान दें', 'यूट्यूब वीडियो के साथ केवल 4 फोटो अपलोड कर सकते हैं');
      return;
    }
    const videoId = getYoutubeVideoId(text);
    setYoutubeThumb(videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
    setFormData(prev => ({ ...prev, youtubeLink: text }));
  };

  const getUnitTypeLabel = (value) => {
    return t.fields.unitType.types[value] || value;
  };

  const getDisplayCategory = () => {
    console.log('User data:', user); // Debug log
    if (!user) return '';
    
    // If business type is homemade or empty, return the selected category
    if (!user.businessType || user.businessType === 'homemade') {
      return formData.category || '';
    }
    
    // If business type is Other, return customBusinessType
    if (user.businessType === 'Other') {
      return user.customBusinessType || '';
    }
    
    // Otherwise return business type
    return user.businessType || '';
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
      },
      'Handmade Pottery & Cookware': {
        en: 'Handmade Pottery & Cookware',
        hi: 'हाथ से बने मिट्टी के बर्तन',
        mr: 'हस्तनिर्मित मातीचे भांडे',
        gu: 'હાથથી બનાવેલા માટીના વાસણ'
      },
      'Microgreens & Herbs': {
        en: 'Microgreens & Herbs',
        hi: 'माइक्रोग्रीन्स और जड़ी बूटी',
        mr: 'मायक्रोग्रीन्स आणि औषधी वनस्पती',
        gu: 'માઇક્રોગ્રીન્સ અને ઔષધીય વનસ્પતિ'
      },
      'Natural & Handmade Soaps': {
        en: 'Natural & Handmade Soaps',
        hi: 'प्राकृतिक और हाथ से बने साबुन',
        mr: 'नैसर्गिक आणि हस्तनिर्मित साबण',
        gu: 'કુદરતી અને હાથથી બનાવેલા સાબુ'
      },
      'Preservative-Free Pickles': {
        en: 'Preservative-Free Pickles',
        hi: 'प्रिजर्वेटिव मुक्त अचार',
        mr: 'प्रिझर्व्हेटिव्ह मुक्त लोणचे',
        gu: 'પ્રિઝર્વેટિવ મુક્ત અથાણા'
      },
      'Pure Honey & Natural Sweeteners': {
        en: 'Pure Honey & Natural Sweeteners',
        hi: 'शुद्ध शहद और प्राकृतिक मिठास',
        mr: 'शुद्ध मध आणि नैसर्गिक गोड पदार्थ',
        gu: 'શુદ્ધ મધ અને કુદરતી મીઠાસ'
      },
      'Handmade Beauty & Wellness Products': {
        en: 'Handmade Beauty & Wellness Products',
        hi: 'हाथ से बने सौंदर्य और स्वास्थ्य उत्पाद',
        mr: 'हस्तनिर्मित सौंदर्य आणि आरोग्य उत्पादने',
        gu: 'હાથથી બનાવેલા સૌંદર્ય અને આરોગ્ય ઉત્પાદનો'
      },
      'Eco-Friendly & Recycled Products': {
        en: 'Eco-Friendly & Recycled Products',
        hi: 'पर्यावरण के अनुकूल और पुनर्चक्रित उत्पाद',
        mr: 'पर्यावरणास अनुकूल आणि पुनर्वापरित उत्पादने',
        gu: 'પર્યાવરણ અનુકૂળ અને પુનઃચક્રિત ઉત્પાદનો'
      },
      'Creative & Artistic Products': {
        en: 'Creative & Artistic Products',
        hi: 'रचनात्मक और कलात्मक उत्पाद',
        mr: 'सर्जनशील आणि कलात्मक उत्पादने',
        gu: 'સર્જનાત્મક અને કલાત્મક ઉત્પાદનો'
      },
      'Other': {
        en: 'Other',
        hi: 'अन्य',
        mr: 'इतर',
        gu: 'અન્ય'
      }
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
      },
      'Chips': {
        en: 'Chips',
        hi: 'चिप्स',
        mr: 'चिप्स',
        gu: 'ચિપ્સ'
      },
      'Other Snacks': {
        en: 'Other Snacks',
        hi: 'अन्य नाश्ता',
        mr: 'इतर नाश्ता',
        gu: 'અન્ય નાસ્તો'
      },
      'Vegetables': {
        en: 'Vegetables',
        hi: 'सब्जियां',
        mr: 'भाजी',
        gu: 'શાકભાજી'
      },
      'Fruits': {
        en: 'Fruits',
        hi: 'फल',
        mr: 'फळे',
        gu: 'ફળો'
      },
      'Leafy Greens': {
        en: 'Leafy Greens',
        hi: 'पत्तेदार सब्जियां',
        mr: 'पालेभाजी',
        gu: 'પાંદડાદાર શાકભાજી'
      },
      'Root Vegetables': {
        en: 'Root Vegetables',
        hi: 'जड़ वाली सब्जियां',
        mr: 'मुळे भाजी',
        gu: 'મૂળ શાકભાજી'
      },
      'Pots': {
        en: 'Pots',
        hi: 'बर्तन',
        mr: 'भांडी',
        gu: 'વાસણ'
      },
      'Pans': {
        en: 'Pans',
        hi: 'कड़ाही',
        mr: 'कढई',
        gu: 'કઢાઈ'
      },
      'Plates': {
        en: 'Plates',
        hi: 'प्लेट',
        mr: 'प्लेट',
        gu: 'પ્લેટ'
      },
      'Bowls': {
        en: 'Bowls',
        hi: 'कटोरे',
        mr: 'वाटी',
        gu: 'વાટી'
      },
      'Microgreens': {
        en: 'Microgreens',
        hi: 'माइक्रोग्रीन्स',
        mr: 'मायक्रोग्रीन्स',
        gu: 'માઇક્રોગ્રીન્સ'
      },
      'Herbs': {
        en: 'Herbs',
        hi: 'जड़ी बूटी',
        mr: 'औषधी वनस्पती',
        gu: 'ઔષધીય વનસ્પતિ'
      },
      'Sprouts': {
        en: 'Sprouts',
        hi: 'अंकुरित',
        mr: 'अंकुरित',
        gu: 'અંકુરિત'
      },
      'Body Soaps': {
        en: 'Body Soaps',
        hi: 'बॉडी साबुन',
        mr: 'बॉडी साबण',
        gu: 'બોડી સાબુ'
      },
      'Face Soaps': {
        en: 'Face Soaps',
        hi: 'फेस साबुन',
        mr: 'फेस साबण',
        gu: 'ફેસ સાબુ'
      },
      'Handmade Soaps': {
        en: 'Handmade Soaps',
        hi: 'हाथ से बने साबुन',
        mr: 'हस्तनिर्मित साबण',
        gu: 'હાથથી બનાવેલા સાબુ'
      },
      'Vegetable Pickles': {
        en: 'Vegetable Pickles',
        hi: 'सब्जी का अचार',
        mr: 'भाजीचे लोणचे',
        gu: 'શાકભાજીનો અથાણો'
      },
      'Fruit Pickles': {
        en: 'Fruit Pickles',
        hi: 'फल का अचार',
        mr: 'फळांचे लोणचे',
        gu: 'ફળોનો અથાણો'
      },
      'Mixed Pickles': {
        en: 'Mixed Pickles',
        hi: 'मिश्रित अचार',
        mr: 'मिश्रित लोणचे',
        gu: 'મિશ્ર અથાણો'
      },
      'Honey': {
        en: 'Honey',
        hi: 'शहद',
        mr: 'मध',
        gu: 'મધ'
      },
      'Jaggery': {
        en: 'Jaggery',
        hi: 'गुड़',
        mr: 'गूळ',
        gu: 'ગોળ'
      },
      'Natural Syrups': {
        en: 'Natural Syrups',
        hi: 'प्राकृतिक सिरप',
        mr: 'नैसर्गिक सिरप',
        gu: 'કુદરતી સિરપ'
      },
      'Skincare': {
        en: 'Skincare',
        hi: 'त्वचा देखभाल',
        mr: 'त्वचेची काळजी',
        gu: 'ત્વચા સંભાળ'
      },
      'Haircare': {
        en: 'Haircare',
        hi: 'बाल देखभाल',
        mr: 'केसांची काळजी',
        gu: 'વાળની સંભાળ'
      },
      'Wellness': {
        en: 'Wellness',
        hi: 'स्वास्थ्य',
        mr: 'आरोग्य',
        gu: 'આરોગ્ય'
      },
      'Home Decor': {
        en: 'Home Decor',
        hi: 'घर की सजावट',
        mr: 'घराची सजावट',
        gu: 'ઘરની સજાવટ'
      },
      'Accessories': {
        en: 'Accessories',
        hi: 'सामान',
        mr: 'सामान',
        gu: 'સામાન'
      },
      'Stationery': {
        en: 'Stationery',
        hi: 'स्टेशनरी',
        mr: 'स्टेशनरी',
        gu: 'સ્ટેશનરી'
      },
      'Art': {
        en: 'Art',
        hi: 'कला',
        mr: 'कला',
        gu: 'કલા'
      },
      'Crafts': {
        en: 'Crafts',
        hi: 'शिल्प',
        mr: 'हस्तकला',
        gu: 'હસ્તકલા'
      },
      'Decor': {
        en: 'Decor',
        hi: 'सजावट',
        mr: 'सजावट',
        gu: 'સજાવટ'
      },
      'Other': {
        en: 'Other',
        hi: 'अन्य',
        mr: 'इतर',
        gu: 'અન્ય'
      }
    };
    return subcategoryTranslations[subcategory]?.[language] || subcategory;
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.steps[1]}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.productName.label}</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder={t.fields.productName.placeholder}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.category.label}</Text>
        {showCustomCategoryInput ? (
          <View>
            <TextInput
              style={styles.input}
              value={customCategoryInput}
              onChangeText={setCustomCategoryInput}
              placeholder={t.fields.category.customPlaceholder || "Enter your category"}
              onSubmitEditing={() => {
                if (customCategoryInput.trim()) {
                  setFormData(prev => ({ ...prev, category: customCategoryInput.trim() }));
                  setShowCustomCategoryInput(false);
                  setCustomCategoryInput('');
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => {
                if (value === 'Other') {
                  setShowCustomCategoryInput(true);
                } else {
                  setFormData(prev => ({ ...prev, category: value }));
                }
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label={t.fields.category.placeholder || "Select Category"} value="" />
              {categories.map((category) => (
                <Picker.Item 
                  key={category} 
                  label={getCategoryLabel(category)} 
                  value={category} 
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.subcategory.label || "Subcategory *"}</Text>
        <View style={styles.subcategoryContainer}>
          <View style={styles.subcategoryInputWrapper}>
            <TextInput
              style={styles.subcategoryInput}
              value={formData.subcategory}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, subcategory: text }));
                if (text.length > 0) {
                  setShowSubcategorySuggestions(false);
                }
              }}
              placeholder={t.fields.subcategory.placeholder || "Enter or select subcategory"}
              placeholderTextColor="#666"
              onFocus={() => {
                if (!formData.subcategory) {
                  setShowSubcategorySuggestions(true);
                }
              }}
            />
          </View>

          {showSubcategorySuggestions && formData.category && !formData.subcategory && (
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
        <Text style={styles.label}>{t.fields.description.label}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder={t.fields.description.placeholder}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.steps[2]}</Text>
      <Text style={styles.stepDescription}>
        {formData.youtubeLink 
          ? t.fields.mediaUpload.description
          : t.fields.mediaUpload.description}
      </Text>
      
      <TouchableOpacity style={styles.imageUpload} onPress={handleImageSource}>
        {selectedImages.length > 0 ? (
          <View style={styles.uploadedImagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPreviewImage(image.uri);
                      setShowImagePreview(true);
                    }}
                  >
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <Text style={styles.imageNumber}>{t.fields.mediaUpload.photoNumber} {index + 1}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      Alert.alert(
                        t.fields.mediaUpload.removeConfirm,
                        t.fields.mediaUpload.removeMessage,
                        [
                          { text: t.fields.mediaUpload.no, style: 'cancel' },
                          { 
                            text: t.fields.mediaUpload.yes, 
                            onPress: () => {
                              setSelectedImages(prev => prev.filter((_, i) => i !== index));
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <View style={styles.removeImageButtonInner}>
                      <Ionicons name="trash-outline" size={20} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            {((formData.youtubeLink && selectedImages.length < 4) || (!formData.youtubeLink && selectedImages.length < 5)) && (
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={handleImageSource}
              >
                <Ionicons name="add-circle" size={24} color="#6C63FF" />
                <Text style={styles.addMoreButtonText}>{t.fields.mediaUpload.addMore}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.imageUploadText}>{t.fields.mediaUpload.tap}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.youtube.label}</Text>
        <TextInput
          style={styles.input}
          value={formData.youtubeLink}
          onChangeText={handleYoutubeLink}
          placeholder={t.fields.youtube.placeholder}
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

      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.fields.imageSource.title}</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={24} color="#6C63FF" />
              <Text style={styles.modalButtonText}>{t.fields.imageSource.camera}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={pickFromGallery}
            >
              <Ionicons name="images" size={24} color="#6C63FF" />
              <Text style={styles.modalButtonText}>{t.fields.imageSource.gallery}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={styles.cancelButtonText}>{t.fields.imageSource.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderImagePreviewModal()}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.steps[3]}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.unitType.label}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.unitType}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, unitType: value }));
              calculateSubUnitPrices(formData.price, value);
            }}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {unitTypes.map((type) => (
              <Picker.Item 
                key={type.value} 
                label={getUnitTypeLabel(type.value)} 
                value={type.value} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.price.label}</Text>
        <View style={styles.priceContainer}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            value={formData.price}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, price: text }));
              calculateSubUnitPrices(text, formData.unitType);
            }}
            keyboardType="numeric"
            placeholder={`${t.fields.price.placeholder} ${getUnitTypeLabel(formData.unitType)}`}
          />
          <Text style={styles.priceUnit}>₹ / {getUnitTypeLabel(formData.unitType)}</Text>
        </View>
      </View>

      {formData.unitType === 'kg' && formData.price && (
        <View style={styles.subUnitPrices}>
          <Text style={styles.subUnitTitle}>{t.fields.price.subUnits.title}</Text>
          <View style={styles.subUnitItem}>
            <Text style={styles.subUnitLabel}>{t.fields.price.subUnits.gram250}</Text>
            <Text style={styles.subUnitValue}>₹{formData.subUnitPrices['250g']}</Text>
          </View>
          <View style={styles.subUnitItem}>
            <Text style={styles.subUnitLabel}>{t.fields.price.subUnits.gram500}</Text>
            <Text style={styles.subUnitValue}>₹{formData.subUnitPrices['500g']}</Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.stock.label}</Text>
        <TextInput
          style={styles.input}
          value={formData.stock}
          onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
          keyboardType="numeric"
          placeholder={t.fields.stock.placeholder}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>{t.steps[4]}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.fields.availability.label}</Text>
        <Text style={styles.sublabel}>{t.fields.availability.sublabel}</Text>
        <View style={styles.locationInputContainer}>
          <TextInput
            ref={ref => setLocationInputRef(ref)}
            style={styles.locationInput}
            value={currentLocation}
            onChangeText={setCurrentLocation}
            placeholder={t.fields.availability.placeholder}
            onSubmitEditing={handleAddLocation}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={styles.addLocationButton} 
            onPress={handleAddLocation}
          >
            <Ionicons name="add-circle" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationsContainer}>
          {formData.availableLocations.map((location, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationChip}
              onPress={() => handleRemoveLocation(location)}
            >
              <Text style={styles.locationChipText}>{location}</Text>
              <View style={styles.locationRemoveButton}>
                <Ionicons name="close-circle" size={20} color="#FF4444" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.previewCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewImages}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.previewImageContainer}>
              <Image source={{ uri: image.uri }} style={styles.previewCardImage} />
              <Text style={styles.previewImageNumber}>{index + 1}</Text>
            </View>
          ))}
        </ScrollView>

        {formData.youtubeLink && (
          <View style={styles.youtubePreview}>
            <Ionicons name="logo-youtube" size={24} color="red" />
            <Text style={styles.youtubeText}>YouTube video attached</Text>
          </View>
        )}

        <View style={styles.previewInfo}>
          <Text style={styles.previewName}>{formData.name}</Text>
          
          <View style={styles.previewPriceContainer}>
            <Text style={styles.previewPrice}>₹{formData.price}</Text>
            <Text style={styles.previewUnit}>/ {getUnitTypeLabel(formData.unitType)}</Text>
          </View>

          {formData.unitType === 'kg' && (
            <View style={styles.previewSubPrices}>
              <Text style={styles.previewSubPrice}>250g: ₹{formData.subUnitPrices['250g']}</Text>
              <Text style={styles.previewSubPrice}>500g: ₹{formData.subUnitPrices['500g']}</Text>
            </View>
          )}

          <Text style={styles.previewStock}>{t.review.stock} {formData.stock} {getUnitTypeLabel(formData.unitType)}</Text>
          
          {formData.description && (
            <Text style={styles.previewDescription}>{formData.description}</Text>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewTags}>
            {formData.tags.map((tag, index) => (
              <Text key={index} style={styles.previewTag}>{tag}</Text>
            ))}
          </ScrollView>
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
          <Text style={styles.modalTitle}>{t.review.title}</Text>
          
          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>{t.review.product}</Text>
            <Text style={styles.confirmationValue}>{formData.name}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>{t.review.price}</Text>
            <Text style={styles.confirmationValue}>₹{formData.price} per {formData.unitSize} {getUnitTypeLabel(formData.unitType)}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>Available In</Text>
            <Text style={styles.confirmationValue}>{formData.availableLocations.join(', ')}</Text>
          </View>

          <View style={styles.confirmationItem}>
            <Text style={styles.confirmationLabel}>{t.review.stock}</Text>
            <Text style={styles.confirmationValue}>{formData.stock} {getUnitTypeLabel(formData.unitType)}</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowConfirmation(false)}
            >
              <Text style={styles.modalButtonTextSecondary}>{t.review.back}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.modalButtonTextPrimary}>
                {loading ? t.review.loading : t.review.confirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderImagePreviewModal = () => (
    <Modal
      visible={showImagePreview}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.fullScreenPreview}>
        <TouchableOpacity 
          style={styles.closePreviewButton}
          onPress={() => setShowImagePreview(false)}
        >
          <Ionicons name="close" size={30} color="#FFF" />
        </TouchableOpacity>
        {selectedPreviewImage && (
          <Image 
            source={{ uri: selectedPreviewImage }} 
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
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
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {step === 4 ? t.buttons.review : t.buttons.next}
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
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  form: {
    padding: 16,
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
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  imageUploadText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
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
  suggestion: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#1976D2',
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    height: 120,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryButtonSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  categoryText: {
    color: '#666',
    fontSize: 16,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
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
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    borderRadius: 12,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
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
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  tagChipText: {
    color: '#6C63FF',
    fontSize: 14,
    marginRight: 4,
  },
  tagRemoveButton: {
    padding: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    marginRight: 8,
  },
  priceUnit: {
    fontSize: 16,
    color: '#666',
  },
  subUnitPrices: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  subUnitTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  subUnitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  subUnitLabel: {
    color: '#666',
  },
  subUnitValue: {
    fontWeight: '500',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewImages: {
    height: 200,
  },
  previewImageContainer: {
    position: 'relative',
  },
  previewCardImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
  },
  previewImageNumber: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFFFFF',
    padding: 4,
    borderRadius: 4,
  },
  youtubePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF3F3',
  },
  youtubeText: {
    marginLeft: 8,
    color: '#666',
  },
  previewInfo: {
    padding: 16,
  },
  previewName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  previewPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  previewUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  previewSubPrices: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewSubPrice: {
    color: '#666',
  },
  previewStock: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  previewDescription: {
    color: '#666',
    marginBottom: 8,
  },
  previewTags: {
    flexDirection: 'row',
    marginTop: 8,
  },
  previewTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    color: '#666',
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
  removeImageButtonInner: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  youtubeThumbContainer: {
    marginTop: 10,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  youtubeThumb: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  youtubePlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 25,
    padding: 10,
  },
  uploadedImagesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  addMoreButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryScrollView: {
    flexGrow: 0,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
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
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  addLocationButton: {
    padding: 8,
  },
  locationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  locationChipText: {
    color: '#6C63FF',
    fontSize: 14,
    marginRight: 4,
  },
  locationRemoveButton: {
    padding: 2,
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  subcategoryContainer: {
    marginTop: 8,
  },
  subcategoryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subcategoryScrollView: {
    flexGrow: 0,
  },
  subcategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  subcategoryChipSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  subcategoryChipText: {
    color: '#666',
    fontSize: 14,
  },
  selectedSubcategory: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedSubcategoryText: {
    fontSize: 14,
    color: '#333',
  },
  subcategoryInputContainer: {
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  subcategoryInput: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    width: '100%',
  },
  subcategoryInputWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  dropdownIcon: {
    padding: 12,
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

export default AddProductScreen; 
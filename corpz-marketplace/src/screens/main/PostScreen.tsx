import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import FloatingInput from '../../components/FloatingInput';
import { CustomAlert } from '../../components/CustomAlert';
import { itemsService } from '../../services/items';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ValidationUtils } from '../../utils/validation';

const PostScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const MAX_IMAGES = 5;

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      CustomAlert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to add product images.',
        undefined,
        'error'
      );
      return false;
    }
    return true;
  };

  const processImage = async (uri: string) => {
    try {
      // First validate the image URI
      const validation = ValidationUtils.validateImageFile(uri);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Get file info to check size
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (blob.size > maxSize) {
        throw new Error('Image must be smaller than 5MB');
      }

      // Verify it's actually an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('File is not a valid image');
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800, height: 600 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const convertImageToBase64 = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Additional security check
      if (!blob.type.startsWith('image/')) {
        throw new Error('Invalid image format');
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          
          // Validate base64 format
          if (!result.startsWith('data:image/')) {
            reject(new Error('Invalid image format'));
            return;
          }
          
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const addImageToList = (base64Image: string) => {
    if (productImages.length < MAX_IMAGES) {
      setProductImages([...productImages, base64Image]);
    } else {
      CustomAlert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images`, undefined, 'warning');
    }
  };

  const removeImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
  };

  const takePhoto = async () => {
    if (productImages.length >= MAX_IMAGES) {
      CustomAlert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images`, undefined, 'warning');
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      setIsUploadingImage(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedUri = await processImage(result.assets[0].uri);
        const base64Image = await convertImageToBase64(processedUri);
        addImageToList(base64Image);
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      CustomAlert.alert('Error', error.message || 'Failed to take photo. Please try again.', undefined, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const pickFromGallery = async () => {
    if (productImages.length >= MAX_IMAGES) {
      CustomAlert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images`, undefined, 'warning');
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      setIsUploadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: MAX_IMAGES - productImages.length,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          if (productImages.length < MAX_IMAGES) {
            try {
              const processedUri = await processImage(asset.uri);
              const base64Image = await convertImageToBase64(processedUri);
              addImageToList(base64Image);
            } catch (error: any) {
              CustomAlert.alert('Error', `Failed to process image: ${error.message}`, undefined, 'error');
              break;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      CustomAlert.alert('Error', error.message || 'Failed to pick image. Please try again.', undefined, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Add Product Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
      ]
    );
  };

  const handleTitleChange = (text: string) => {
    const sanitized = ValidationUtils.sanitizeTextInput(text, 100);
    setTitle(sanitized);
  };

  const handleDescriptionChange = (text: string) => {
    const sanitized = ValidationUtils.sanitizeTextInput(text, 1000);
    setDescription(sanitized);
  };

  const handlePriceChange = (text: string) => {
    // Only allow numbers and decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    setPrice(sanitized);
  };

  const handleStockChange = (text: string) => {
    // Only allow numbers
    const sanitized = text.replace(/[^0-9]/g, '');
    setStock(sanitized);
  };

  const validateInputs = () => {
    if (!title.trim()) {
      CustomAlert.alert('Validation Error', 'Title is required', undefined, 'error');
      return false;
    }

    if (title.trim().length < 3) {
      CustomAlert.alert('Validation Error', 'Title must be at least 3 characters long', undefined, 'error');
      return false;
    }

    if (!description.trim()) {
      CustomAlert.alert('Validation Error', 'Description is required', undefined, 'error');
      return false;
    }

    if (description.trim().length < 10) {
      CustomAlert.alert('Validation Error', 'Description must be at least 10 characters long', undefined, 'error');
      return false;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      CustomAlert.alert('Validation Error', 'Please enter a valid price greater than 0', undefined, 'error');
      return false;
    }

    if (priceValue > 1000000) {
      CustomAlert.alert('Validation Error', 'Price cannot exceed ₱1,000,000', undefined, 'error');
      return false;
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      CustomAlert.alert('Validation Error', 'Please enter a valid stock quantity (0 or more)', undefined, 'error');
      return false;
    }

    if (stockValue > 10000) {
      CustomAlert.alert('Validation Error', 'Stock cannot exceed 10,000 items', undefined, 'error');
      return false;
    }

    return true;
  };

  const handlePost = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);

      await itemsService.createItem({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category || 'Other',
        image_url: productImages.length > 0 ? productImages[0] : undefined,
      });

      CustomAlert.alert(
        'Success',
        'Item posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setPrice('');
              setStock('');
              setCategory('');
              setProductImages([]);
              // Navigate to Home tab to see the new item
              navigation.navigate('Home');
            }
          }
        ],
        'success'
      );
    } catch (error: any) {
      console.error('Error posting item:', error);
      let errorMessage = 'Failed to post item. Please try again.';

      if (error?.message?.includes('not authenticated')) {
        errorMessage = 'Please log in again to post items.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      CustomAlert.alert('Error', errorMessage, undefined, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Post New Item</Text>
          <Text style={styles.subtitle}>Share your products with the community</Text>
        </View>

        <View style={styles.form}>
          {/* Image Upload */}
          <View style={styles.imageSection}>
            <Text style={styles.imageSectionTitle}>
              Product Images ({productImages.length}/{MAX_IMAGES})
            </Text>

            {productImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesList}
                contentContainerStyle={styles.imagesListContent}
              >
                {productImages.map((image, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.imageUpload,
                productImages.length >= MAX_IMAGES && styles.imageUploadDisabled
              ]}
              onPress={handleImageUpload}
              disabled={isUploadingImage || productImages.length >= MAX_IMAGES}
            >
              <Ionicons
                name={isUploadingImage ? "hourglass-outline" : "camera-outline"}
                size={40}
                color={productImages.length >= MAX_IMAGES ? COLORS.textLight : COLORS.textSecondary}
              />
              <Text style={[
                styles.imageUploadText,
                productImages.length >= MAX_IMAGES && styles.imageUploadTextDisabled
              ]}>
                {isUploadingImage ? 'Processing...' :
                 productImages.length >= MAX_IMAGES ? 'Maximum images reached' : 'Add Photos'}
              </Text>
              <Text style={[
                styles.imageUploadSubtext,
                productImages.length >= MAX_IMAGES && styles.imageUploadTextDisabled
              ]}>
                {isUploadingImage ? 'Please wait...' :
                 productImages.length >= MAX_IMAGES ? `${MAX_IMAGES} images maximum` : 'Tap to upload product images'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Item Details */}
          <FloatingInput
            label="Item Title *"
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Enter item title"
          />

          <FloatingInput
            label="Description *"
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder=""
            multiline
            numberOfLines={4}
            containerStyle={styles.textArea}
          />

          <View style={styles.row}>
            <FloatingInput
              label="Price *"
              value={price}
              onChangeText={handlePriceChange}
              placeholder="₱ 0.00"
              keyboardType="numeric"
              containerStyle={styles.priceInput}
            />

            <FloatingInput
              label="Stock *"
              value={stock}
              onChangeText={handleStockChange}
              placeholder="0"
              keyboardType="numeric"
              containerStyle={styles.halfWidth}
            />
          </View>

          {/* Category Selection */}
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Post Button */}
          <TouchableOpacity
            style={[styles.postButton, isLoading && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={isLoading}
          >
            <Text style={styles.postButtonText}>
              {isLoading ? 'Posting...' : 'Post Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  form: {
    paddingHorizontal: SPACING.lg,
  },
  imageUpload: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  imageUploadSubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 200,
    height: 150,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  imageSection: {
    marginBottom: SPACING.lg,
  },
  imageSectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  imagesList: {
    marginBottom: SPACING.md,
  },
  imagesListContent: {
    paddingRight: SPACING.md,
  },
  imageUploadDisabled: {
    opacity: 0.5,
  },
  imageUploadTextDisabled: {
    color: COLORS.textLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  categoryChipTextSelected: {
    color: COLORS.secondary,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  currencySymbol: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    marginTop: SPACING.md,
  },
  priceInput: {
    flex: 1,
  },
});

export default PostScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import FloatingInput from '../../components/FloatingInput';
import { CustomAlert } from '../../components/CustomAlert';
import { useAuth } from '../../store/AuthContext';
import { usersService } from '../../services/users';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface Props {
  navigation: any;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePic || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      CustomAlert.alert('Error', 'Please enter your name', undefined, 'error');
      return;
    }

    if (name.trim() === user?.name) {
      CustomAlert.alert('Info', 'No changes to save', undefined, 'info');
      return;
    }

    try {
      setIsLoading(true);
      
      await usersService.updateProfile({ name: name.trim() });
      
      await refreshUserProfile();
      
      CustomAlert.alert(
        'Success', 
        'Profile updated successfully!', 
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        'success'
      );
    } catch (error) {
      CustomAlert.alert('Error', 'Failed to update profile. Please try again.', undefined, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      CustomAlert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to change your profile picture.',
        undefined,
        'error'
      );
      return false;
    }
    return true;
  };

  const processImage = async (uri: string) => {
    try {
      // Try to resize and compress the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(uri, [
        { resize: { width: 400, height: 400 } }
      ], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG
      });
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      // If image manipulation fails, return original URI
      return uri;
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);
      const processedUri = await processImage(imageUri);
      const publicUrl = await usersService.uploadProfilePicture(processedUri);
      setProfileImage(publicUrl);
      await refreshUserProfile();
      CustomAlert.alert('Success', 'Profile picture updated successfully!', undefined, 'success');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      let errorMessage = 'Failed to upload profile picture. Please try again.';

      if (error?.message?.includes('not authenticated')) {
        errorMessage = 'Please log in again to update your profile picture.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message?.includes('storage')) {
        errorMessage = 'Storage error. The image will be saved locally.';
      }

      CustomAlert.alert('Error', errorMessage, undefined, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      CustomAlert.alert('Error', 'Failed to take photo. Please try again.', undefined, 'error');
    }
  };

  const pickFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      CustomAlert.alert('Error', 'Failed to pick image. Please try again.', undefined, 'error');
    }
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleChangeProfilePicture}
            disabled={isUploadingImage}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={120} color={COLORS.textSecondary} />
            )}
            <View style={[styles.cameraIcon, isUploadingImage && styles.cameraIconDisabled]}>
              <Ionicons
                name={isUploadingImage ? "hourglass-outline" : "camera"}
                size={20}
                color={COLORS.white}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>
            {isUploadingImage ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </View>

        <View style={styles.formSection}>
          <FloatingInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            containerStyle={styles.input}
          />

          <View style={styles.emailSection}>
            <Text style={styles.emailLabel}>Email Address</Text>
            <Text style={styles.emailValue}>{user?.email}</Text>
            <Text style={styles.emailNote}>
              To change your email, go to Privacy & Security settings
            </Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  saveButton: {
    padding: SPACING.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  saveButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundSecondary,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  changePhotoText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  formSection: {
    paddingHorizontal: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.lg,
  },
  emailSection: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  emailLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emailValue: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emailNote: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

export default EditProfileScreen; 
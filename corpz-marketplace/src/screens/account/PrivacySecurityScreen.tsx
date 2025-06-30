import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlert } from '../../components/CustomAlert';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

const PrivacySecurityScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      CustomAlert.alert('Error', 'Please type "delete" to confirm account deletion', undefined, 'error');
      return;
    }

    try {
      setIsDeleting(true);

      // Delete user data from database
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);

      if (deleteError) throw deleteError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');
      if (authError) {
        console.warn('Auth deletion failed:', authError);
        // Continue anyway as the user data is deleted
      }

      CustomAlert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [{ text: 'OK', onPress: () => logout() }],
        'success'
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      CustomAlert.alert('Error', 'Failed to delete account. Please try again.', undefined, 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setDeleteConfirmText('');
    }
  };

  const securityOptions = [
    {
      icon: 'lock-closed-outline',
      title: 'Change Password',
      description: 'Update your account password',
      onPress: () => CustomAlert.alert('Coming Soon', 'Password change feature will be available soon!', undefined, 'info'),
    },
    {
      icon: 'mail-outline',
      title: 'Change Email',
      description: 'Update your email address',
      onPress: () => CustomAlert.alert('Coming Soon', 'Email change feature will be available soon!', undefined, 'info'),
    },
    {
      icon: 'person-outline',
      title: 'Change Name',
      description: 'Update your display name',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security',
      onPress: () => CustomAlert.alert('Coming Soon', 'Two-factor authentication will be available soon!', undefined, 'info'),
    },
    {
      icon: 'eye-outline',
      title: 'Privacy Settings',
      description: 'Control who can see your information',
      onPress: () => CustomAlert.alert('Coming Soon', 'Privacy settings will be available soon!', undefined, 'info'),
    },
    {
      icon: 'trash-outline',
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      onPress: () => setDeleteModalVisible(true),
      isDestructive: true,
    },
    {
      icon: 'document-text-outline',
      title: 'Data & Privacy',
      description: 'Manage your data and privacy preferences',
      onPress: () => CustomAlert.alert('Coming Soon', 'Data & privacy management will be available soon!', undefined, 'info'),
    },
    {
      icon: 'business-outline',
      title: 'Blocked Users',
      description: 'Manage blocked users and sellers',
      onPress: () => CustomAlert.alert('Coming Soon', 'User blocking feature will be available soon!', undefined, 'info'),
    },
    {
      icon: 'download-outline',
      title: 'Download My Data',
      description: 'Get a copy of your data',
      onPress: () => CustomAlert.alert('Coming Soon', 'Data download feature will be available soon!', undefined, 'info'),
    },
    {
      icon: 'trash-outline',
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      onPress: () => setDeleteModalVisible(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {securityOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.optionCard,
                option.title === 'Delete Account' && styles.dangerOption
              ]}
              onPress={option.onPress}
            >
              <View style={[
                styles.optionIcon,
                option.title === 'Delete Account' && styles.dangerIcon
              ]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={option.title === 'Delete Account' ? COLORS.error : COLORS.primary} 
                />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionTitle,
                  option.title === 'Delete Account' && styles.dangerText
                ]}>
                  {option.title}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Security Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.tipText}>
              Keep your account secure by using a strong password and enabling two-factor authentication.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning-outline" size={48} color={COLORS.error} />
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalDescription}>
                This action cannot be undone. All your data, including listings, orders, and messages will be permanently deleted.
              </Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.confirmLabel}>
                Type "delete" to confirm:
              </Text>
              <TextInput
                style={styles.confirmInput}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type delete here"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  (deleteConfirmText.toLowerCase() !== 'delete' || isDeleting) && styles.deleteButtonDisabled
                ]}
                onPress={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  placeholder: {
    width: 40,
  },
  optionsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  dangerOption: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  dangerIcon: {
    backgroundColor: '#FFEBEE',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dangerText: {
    color: COLORS.error,
  },
  optionDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  infoTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  tipText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.medium,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.error,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBody: {
    marginBottom: SPACING.lg,
  },
  confirmLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.inputBackground,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});

export default PrivacySecurityScreen; 
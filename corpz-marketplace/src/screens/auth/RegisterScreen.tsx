import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import FloatingInput from '../../components/FloatingInput';
import { CustomAlert } from '../../components/CustomAlert';
import { useAuth } from '../../store/AuthContext';
import { AuthStackParamList } from '../../types';
import { AUTH_COLORS as COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ValidationUtils } from '../../utils/validation';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const { register } = useAuth();

  const handleNameChange = (text: string) => {
    const sanitized = ValidationUtils.sanitizeTextInput(text, 50);
    setName(sanitized);
  };

  const handleEmailChange = (text: string) => {
    const sanitized = ValidationUtils.sanitizeTextInput(text, 254);
    setEmail(sanitized);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    
    // Check password strength in real-time
    const validation = ValidationUtils.validatePassword(text);
    if (validation.isValid && validation.strength) {
      setPasswordStrength(validation.strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'strong': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  const handleRegister = async () => {
    // Rate limiting check
    const deviceId = 'register_' + (email || 'unknown');
    if (!ValidationUtils.rateLimitCheck(deviceId, 3, 30 * 60 * 1000)) {
      CustomAlert.alert(
        'Too Many Attempts', 
        'Too many registration attempts. Please wait 30 minutes before trying again.',
        undefined,
        'error'
      );
      return;
    }

    // Enhanced validation
    const nameValidation = ValidationUtils.validateName(name);
    if (!nameValidation.isValid) {
      CustomAlert.alert('Invalid Name', nameValidation.error!, undefined, 'error');
      return;
    }

    const emailValidation = ValidationUtils.validateEmail(email);
    if (!emailValidation.isValid) {
      CustomAlert.alert('Invalid Email', emailValidation.error!, undefined, 'error');
      return;
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      CustomAlert.alert('Weak Password', passwordValidation.error!, undefined, 'error');
      return;
    }

    if (password !== confirmPassword) {
      CustomAlert.alert('Password Mismatch', 'Passwords do not match', undefined, 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use sanitized name and email
      const sanitizedName = nameValidation.sanitized!;
      const sanitizedEmail = email.trim().toLowerCase();
      
      await register(sanitizedEmail, password, sanitizedName);

      CustomAlert.alert(
        'Successfully Registered!',
        'Welcome to Corpz! You can now start exploring and shopping.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // The auth state change will handle navigation automatically
            }
          }
        ],
        'success'
      );

      setTimeout(() => {
        // Navigation will be handled by auth state change
      }, 3000);
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error?.message?.includes('User already registered')) {
        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
      } else if (error?.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 8 characters long with mixed characters.';
      } else if (error?.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      CustomAlert.alert('Registration Failed', errorMessage, undefined, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.brandName}>Corpz</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <FloatingInput
              label="Full Name"
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={50}
            />

            <FloatingInput
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
            />

            <View style={styles.passwordContainer}>
              <FloatingInput
                label="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={128}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
                  Password strength: {passwordStrength || 'Too weak'}
                </Text>
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementText}>
                    Password must contain at least 3 of the following:
                  </Text>
                  <Text style={styles.requirementText}>• Lowercase letters</Text>
                  <Text style={styles.requirementText}>• Uppercase letters</Text>
                  <Text style={styles.requirementText}>• Numbers</Text>
                  <Text style={styles.requirementText}>• Special characters</Text>
                </View>
              </View>
            )}

            <View style={styles.passwordContainer}>
              <FloatingInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={128}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  brandName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: SPACING.md,
    top: 18,
    padding: SPACING.xs,
  },
  passwordStrengthContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  passwordStrengthText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  passwordRequirements: {
    marginTop: SPACING.xs,
  },
  requirementText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  linkText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
});

export default RegisterScreen;

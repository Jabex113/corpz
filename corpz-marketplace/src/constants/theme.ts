export const COLORS = {
  // Primary colors - Modern gradient-inspired
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#FFFFFF',
  accent: '#F59E0B', // Amber
  white: '#FFFFFF',
  black: '#000000',

  // Text colors - Better contrast
  text: '#111827', // Dark gray instead of pure black
  textSecondary: '#6B7280', // Medium gray
  textLight: '#9CA3AF', // Light gray
  textMuted: '#D1D5DB',

  // Background colors - Softer, warmer tones
  background: '#FAFAFA', // Very light gray
  backgroundSecondary: '#F3F4F6', // Light gray
  backgroundTertiary: '#E5E7EB', // Medium light gray
  surface: '#FFFFFF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Status colors - More vibrant
  success: '#10B981', // Emerald
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue

  // Input colors
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputFocus: '#6366F1',
  placeholder: '#9CA3AF',

  // Disabled colors
  disabled: '#F3F4F6',
  disabledBorder: '#E5E7EB',
  textDisabled: '#9CA3AF',

  // Category colors
  electronics: '#3B82F6',
  fashion: '#EC4899',
  home: '#10B981',
  sports: '#F59E0B',
  books: '#8B5CF6',
  other: '#6B7280',
};

// Auth screens theme (black and white)
export const AUTH_COLORS = {
  // Primary colors
  primary: '#000000',
  secondary: '#FFFFFF',
  white: '#FFFFFF',

  // Text colors
  text: '#000000',
  textSecondary: '#666666',
  textLight: '#999999',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',

  // Border colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',

  // Status colors
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',

  // Input colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E5E5E5',
  inputFocus: '#000000',
  placeholder: '#999999',

  // Disabled colors
  disabled: '#F3F4F6',
  disabledBorder: '#E5E7EB',
  textDisabled: '#9CA3AF',
};

export const FONTS = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

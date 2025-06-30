import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

interface FloatingInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  disabled?: boolean;
  required?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  value = '',
  onFocus,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  multiline = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  
  // Use separate animated values for better control
  const labelPositionY = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
  const labelPositionX = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
  const labelScale = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  // Update hasValue when value prop changes
  useEffect(() => {
    const valueExists = Boolean(value);
    setHasValue(valueExists);
    animateLabel(valueExists || isFocused);
  }, [value, isFocused]);

  const handleFocus = useCallback((e: any) => {
    if (disabled) return;
    
    setIsFocused(true);
    animateLabel(true);
    onFocus?.(e);
  }, [disabled, onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    const shouldKeepLabelUp = Boolean(value);
    animateLabel(shouldKeepLabelUp);
    onBlur?.(e);
  }, [value, onBlur]);

  const animateLabel = useCallback((up: boolean) => {
    const toValue = up ? 1 : 0;
    
    Animated.parallel([
      Animated.timing(labelPositionY, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelPositionX, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelScale, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [labelPositionY, labelPositionX, labelScale]);

  const handleContainerPress = useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Dynamic label styles
  const animatedLabelStyle = {
    position: 'absolute' as const,
    left: labelPositionX.interpolate({
      inputRange: [0, 1],
      outputRange: [SPACING.md, SPACING.sm],
    }),
    top: labelPositionY.interpolate({
      inputRange: [0, 1],
      outputRange: [multiline ? 20 : 18, -8],
    }),
    fontSize: labelScale.interpolate({
      inputRange: [0, 1],
      outputRange: [FONT_SIZES.md, FONT_SIZES.xs],
    }),
    color: (() => {
      if (error) return COLORS.error;
      if (isFocused) return COLORS.primary;
      if (hasValue) return COLORS.textSecondary;
      return COLORS.placeholder;
    })(),
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: labelScale.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    fontFamily: FONTS.regular,
    zIndex: 1,
  };

  // Determine input container styles
  const getInputContainerStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.inputContainer];
    
    if (multiline) {
      baseStyle.push(styles.multilineContainer);
    }
    
    if (isFocused) {
      baseStyle.push(styles.inputContainerFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputContainerError);
    }
    
    if (disabled) {
      baseStyle.push(styles.inputContainerDisabled);
    }
    
    return baseStyle;
  };

  // Determine when to show placeholder
  const shouldShowPlaceholder = false; // Disable placeholder since we have floating label

  // Create display label with required indicator
  const displayLabel = required ? `${label} *` : label;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputWrapper}>
        <Animated.Text style={[animatedLabelStyle, labelStyle]}>
          {displayLabel}
        </Animated.Text>
        
        <TouchableWithoutFeedback onPress={handleContainerPress}>
          <View style={getInputContainerStyle()}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                multiline && styles.multilineInput,
                disabled && styles.inputDisabled,
                inputStyle,
              ]}
              value={value}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={shouldShowPlaceholder ? placeholder : undefined}
              placeholderTextColor={COLORS.placeholder}
              editable={!disabled}
              multiline={multiline}
              textAlignVertical={multiline ? 'top' : 'center'}
              {...props}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    height: 56,
    justifyContent: 'center',
  },
  multilineContainer: {
    height: 100,
    alignItems: 'stretch',
  },
  inputContainerFocused: {
    borderColor: COLORS.inputFocus,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.disabled || '#f5f5f5',
    borderColor: COLORS.disabledBorder || '#e0e0e0',
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    margin: 0,
    padding: 0,
    flex: 1,
    textAlignVertical: 'center',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: COLORS.textDisabled || '#999',
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});

export default FloatingInput;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

class AlertManager {
  private static instance: AlertManager;
  private showAlert?: (options: AlertOptions) => void;

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  setShowAlert(showAlert: (options: AlertOptions) => void) {
    this.showAlert = showAlert;
  }

  alert(title: string, message: string, buttons?: AlertButton[], type?: 'success' | 'error' | 'warning' | 'info') {
    if (this.showAlert) {
      this.showAlert({ title, message, buttons, type });
    }
  }
}

export const CustomAlert = {
  alert: (title: string, message: string, buttons?: AlertButton[], type?: 'success' | 'error' | 'warning' | 'info') => {
    AlertManager.getInstance().alert(title, message, buttons, type);
  },
};

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options);
    setVisible(true);
  }, []);

  useEffect(() => {
    AlertManager.getInstance().setShowAlert(showAlert);
  }, [showAlert]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 200,
          friction: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnimation, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setAlertOptions(null);
    });
  };

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'error':
        return { name: 'close-circle', color: '#F44336' };
      case 'warning':
        return { name: 'warning', color: '#FF9800' };
      case 'info':
        return { name: 'information-circle', color: COLORS.primary };
      default:
        return { name: 'information-circle', color: COLORS.primary };
    }
  };

  if (!visible || !alertOptions) {
    return <>{children}</>;
  }

  const icon = getIconForType(alertOptions.type);
  const buttons = alertOptions.buttons || [{ text: 'OK', onPress: handleClose }];

  return (
    <>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <BlurView intensity={10} style={StyleSheet.absoluteFillObject} />
          <Animated.View
            style={[
              styles.alertContainer,
              {
                transform: [{ scale: scaleAnimation }],
                opacity: opacityAnimation,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={icon.name as any} size={48} color={icon.color} />
            </View>
            
            <Text style={styles.title}>{alertOptions.title}</Text>
            <Text style={styles.message}>{alertOptions.message}</Text>
            
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                    buttons.length > 1 && index === 0 && styles.firstButton,
                  ]}
                  onPress={() => {
                    handleClose();
                    button.onPress?.();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: Dimensions.get('window').width - SPACING.xl * 2,
    maxWidth: 340,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: 'center',
  },
  firstButton: {
    marginRight: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  destructiveButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.text,
  },
  destructiveButtonText: {
    color: COLORS.white,
  },
}); 
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const helpOptions = [
    {
      icon: 'help-circle-outline',
      title: 'FAQ',
      description: 'Find answers to frequently asked questions',
      onPress: () => {},
    },
    {
      icon: 'chatbubble-outline',
      title: 'Contact Support',
      description: 'Get help from our support team',
      onPress: () => {},
    },
    {
      icon: 'call-outline',
      title: 'Call Us',
      description: process.env.EXPO_PUBLIC_COMPANY_PHONE || '+1234567890',
      onPress: () => Linking.openURL(`tel:${process.env.EXPO_PUBLIC_COMPANY_PHONE || '+1234567890'}`),
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      description: process.env.EXPO_PUBLIC_COMPANY_EMAIL || 'support@example.com',
      onPress: () => Linking.openURL(`mailto:${process.env.EXPO_PUBLIC_COMPANY_EMAIL || 'support@example.com'}`),
    },
    {
      icon: 'document-text-outline',
      title: 'User Guide',
      description: 'Learn how to use Corpz Marketplace',
      onPress: () => {},
    },
    {
      icon: 'shield-outline',
      title: 'Report a Problem',
      description: 'Report bugs or issues',
      onPress: () => {},
    },
    {
      icon: 'business-outline',
      title: 'Seller Support',
      description: 'Get help with selling on Corpz',
      onPress: () => {},
    },
  ];

  const quickHelp = [
    'How to create a listing',
    'Payment methods accepted',
    'Shipping and delivery',
    'Return and refund policy',
    'Account verification',
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
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.quickHelpSection}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          {quickHelp.map((topic, index) => (
            <TouchableOpacity key={index} style={styles.quickHelpItem}>
              <Text style={styles.quickHelpText}>{topic}</Text>
              <Ionicons name="chevron-forward-outline" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {helpOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon as any} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.operatingHours}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Monday - Friday</Text>
              <Text style={styles.timeText}>9:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Saturday</Text>
              <Text style={styles.timeText}>9:00 AM - 3:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Sunday</Text>
              <Text style={styles.timeText}>Closed</Text>
            </View>
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
  placeholder: {
    width: 40,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickHelpSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickHelpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  quickHelpText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  contactSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
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
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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
  optionDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  operatingHours: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dayText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  timeText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default HelpSupportScreen; 
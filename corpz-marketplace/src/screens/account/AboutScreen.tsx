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

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const aboutSections = [
    {
      title: 'Legal',
      items: [
        { title: 'Terms of Service', onPress: () => {} },
        { title: 'Privacy Policy', onPress: () => {} },
        { title: 'Cookie Policy', onPress: () => {} },
        { title: 'Community Guidelines', onPress: () => {} },
      ],
    },
    {
      title: 'Company',
      items: [
        { title: 'About Corpz', onPress: () => {} },
        { title: 'Careers', onPress: () => Linking.openURL(process.env.EXPO_PUBLIC_CAREERS_URL || 'https://example.com/careers') },
        { title: 'Press & Media', onPress: () => {} },
        { title: 'Investor Relations', onPress: () => {} },
      ],
    },
    {
      title: 'Follow Us',
      items: [
        { title: 'Facebook', onPress: () => Linking.openURL(process.env.EXPO_PUBLIC_FACEBOOK_URL || 'https://facebook.com') },
        { title: 'Twitter', onPress: () => Linking.openURL(process.env.EXPO_PUBLIC_TWITTER_URL || 'https://twitter.com') },
        { title: 'Instagram', onPress: () => Linking.openURL(process.env.EXPO_PUBLIC_INSTAGRAM_URL || 'https://instagram.com') },
        { title: 'LinkedIn', onPress: () => Linking.openURL(process.env.EXPO_PUBLIC_LINKEDIN_URL || 'https://linkedin.com') },
      ],
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
        <Text style={styles.title}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{(process.env.EXPO_PUBLIC_COMPANY_NAME || 'Corpz').split(' ')[0]}</Text>
          </View>
          <Text style={styles.appName}>{process.env.EXPO_PUBLIC_APP_NAME || 'Corpz Marketplace'}</Text>
          <Text style={styles.appDescription}>
            {process.env.EXPO_PUBLIC_APP_DESCRIPTION || 'The premier marketplace for buying and selling in the Philippines'}
          </Text>
          <Text style={styles.versionText}>Version {process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0'}</Text>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To create a safe, reliable, and user-friendly marketplace that connects buyers and sellers across the Philippines, fostering economic growth and community development.
          </Text>
        </View>

        {aboutSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={styles.linkItem}
                onPress={item.onPress}
              >
                <Text style={styles.linkText}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>
                  {process.env.EXPO_PUBLIC_COMPANY_ADDRESS || 'Makati City, Metro Manila, Philippines'}
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{process.env.EXPO_PUBLIC_COMPANY_EMAIL || 'hello@corpz.ph'}</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{process.env.EXPO_PUBLIC_COMPANY_PHONE || '+63 2 8888 CORPZ'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 {process.env.EXPO_PUBLIC_COMPANY_NAME || 'Corpz Marketplace'}. All rights reserved.
          </Text>
          <Text style={styles.copyrightSubtext}>
            Made with Jabez Llave
          </Text>
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
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  appDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  versionText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  missionSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  missionText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  linkText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  contactSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  contactInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  contactLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: 2,
  },
  contactValue: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  copyrightText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  copyrightSubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default AboutScreen; 
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    messages: true,
    promotions: false,
    priceDrops: true,
    newListings: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const notificationSections = [
    {
      title: 'Order Notifications',
      items: [
        { key: 'orderUpdates', label: 'Order status updates', description: 'Get notified when your order status changes' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { key: 'messages', label: 'New messages', description: 'Get notified when you receive new messages' },
      ],
    },
    {
      title: 'Shopping',
      items: [
        { key: 'priceDrops', label: 'Price drops', description: 'Get notified when items you liked go on sale' },
        { key: 'newListings', label: 'New listings', description: 'Get notified about new items in your favorite categories' },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { key: 'promotions', label: 'Promotions & offers', description: 'Receive special offers and promotional updates' },
      ],
    },
    {
      title: 'Delivery Method',
      items: [
        { key: 'emailNotifications', label: 'Email notifications', description: 'Receive notifications via email' },
        { key: 'pushNotifications', label: 'Push notifications', description: 'Receive notifications on your device' },
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
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.sectionsContainer}>
          {notificationSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.key} style={styles.notificationItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                  <Switch
                    value={notifications[item.key as keyof typeof notifications]}
                    onValueChange={(value) => updateNotification(item.key, value)}
                    trackColor={{ false: COLORS.borderLight, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                </View>
              ))}
            </View>
          ))}
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
  sectionsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default NotificationsScreen; 
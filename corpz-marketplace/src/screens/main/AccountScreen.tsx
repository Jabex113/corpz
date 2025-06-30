import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../store/AuthContext';
import { CustomAlert } from '../../components/CustomAlert';
import { ordersService } from '../../services/orders';
import { followsService } from '../../services/follows';
import { RootStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

type AccountScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: AccountScreenNavigationProp;
}

const AccountScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

  const fetchUserStats = useCallback(async () => {
    try {
      const userStats = await ordersService.getOrderStats();
      setStats(userStats);
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }, []);

  const fetchFollowCounts = useCallback(async () => {
    if (user?.id) {
      try {
        const counts = await followsService.getFollowCounts(user.id);
        setFollowCounts(counts);
      } catch (error) {
        // Handle error silently
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserStats();
    fetchFollowCounts();
  }, [fetchUserStats, fetchFollowCounts]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Navigation will be handled automatically by auth state change
    } catch (error) {
      console.error('Logout error:', error);
      CustomAlert.alert('Error', 'Failed to logout. Please try again.', undefined, 'error');
    }
  }, [logout]);

  const menuItems = useMemo(() => [
    {
      id: '1',
      title: 'My Listings',
      icon: 'bag-outline',
      onPress: () => navigation.navigate('MyListings'),
    },
    {
      id: '2',
      title: 'Purchase History',
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('PurchaseHistory'),
    },
    {
      id: '3',
      title: 'Favorites',
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      id: '4',
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: '5',
      title: 'Shipping Address',
      icon: 'location-outline',
      onPress: () => navigation.navigate('ShippingAddress'),
    },
    {
      id: '6',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: '7',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => navigation.navigate('PrivacySecurity'),
    },
    {
      id: '8',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: '9',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('About'),
    },
  ], [navigation]);

  const formattedRevenue = useMemo(() => {
    return stats?.totalRevenue ? stats.totalRevenue.toFixed(0) : '0';
  }, [stats?.totalRevenue]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleFollowersPress = useCallback(() => {
    if (user?.id) {
      navigation.navigate('Followers', { userId: user.id });
    }
  }, [navigation, user?.id]);

  const handleFollowingPress = useCallback(() => {
    if (user?.id) {
      navigation.navigate('Following', { userId: user.id });
    }
  }, [navigation, user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={80} color={COLORS.textSecondary} />
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Follow Stats */}
          <View style={styles.followStatsContainer}>
            <TouchableOpacity style={styles.followStatItem} onPress={handleFollowersPress}>
              <Text style={styles.followStatNumber}>{followCounts.followers}</Text>
              <Text style={styles.followStatLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followStatItem} onPress={handleFollowingPress}>
              <Text style={styles.followStatNumber}>{followCounts.following}</Text>
              <Text style={styles.followStatLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.totalSales || 0}</Text>
            <Text style={styles.statLabel}>Items Sold</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₱{formattedRevenue}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.pendingOrders || 0}</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundSecondary,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  editProfileButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editProfileButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  followStatsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.xl,
  },
  followStatItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  followStatNumber: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  followStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
  },
  menuContainer: {
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  versionText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});

export default AccountScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { followsService } from '../../services/follows';
import { CustomAlert } from '../../components/CustomAlert';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
  route: any;
}

const FollowingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      setLoading(true);
      const data = await followsService.getFollowing(userId);
      setFollowing(data || []);
    } catch (error: any) {
      CustomAlert.alert('Error', 'Failed to load following', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFollowing();
    setRefreshing(false);
  }, []);

  const handleUserPress = (user: any) => {
    // Navigate to user profile or chat
    navigation.navigate('Chat', { userId: user.id, userName: user.name });
  };

  const handleUnfollow = async (user: any) => {
    try {
      await followsService.unfollowUser(user.id);
      setFollowing(prev => prev.filter(u => u.id !== user.id));
      CustomAlert.alert('Unfollowed', `You are no longer following ${user.name}`, undefined, 'success');
    } catch (error: any) {
      CustomAlert.alert('Error', 'Failed to unfollow user', undefined, 'error');
    }
  };

  const renderFollowingItem = (user: any) => {
    return (
      <View
        key={user.id}
        style={styles.followingItem}
      >
        <TouchableOpacity
          style={styles.userSection}
          onPress={() => handleUserPress(user)}
        >
          <View style={styles.avatarContainer}>
            {user.profile_pic ? (
              <Image source={{ uri: user.profile_pic }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person-outline" size={24} color={COLORS.textLight} />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleUserPress(user)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.unfollowButton}
            onPress={() => handleUnfollow(user)}
          >
            <Text style={styles.unfollowText}>Unfollow</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.title}>Following</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {following.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={80} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Not Following Anyone</Text>
              <Text style={styles.emptySubtitle}>
                Start following people to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.followingContainer}>
              {following.map(renderFollowingItem)}
            </View>
          )}
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  followingContainer: {
    paddingHorizontal: SPACING.lg,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  chatButton: {
    padding: SPACING.sm,
  },
  unfollowButton: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  unfollowText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default FollowingScreen; 
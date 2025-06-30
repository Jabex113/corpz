import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlert } from './CustomAlert';
import { searchService } from '../services/search';
import { followsService } from '../services/follows';
import { useAuth } from '../store/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect?: (user: any) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ visible, onClose, onUserSelect }) => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setUsers([]);
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const results = await searchService.searchUsers(searchQuery);
      setUsers(results);
      
      // Check follow status for each user
      const followStatuses = new Set<string>();
      for (const user of results) {
        if (user.id !== currentUser?.id) {
          const isFollowing = await followsService.isFollowing(user.id);
          if (isFollowing) {
            followStatuses.add(user.id);
          }
        }
      }
      setFollowingUsers(followStatuses);
    } catch (error) {
      console.error('Error searching users:', error);
      CustomAlert.alert('Error', 'Failed to search users', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId: string) => {
    try {
      const newFollowStatus = await followsService.toggleFollow(userId);
      
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        if (newFollowStatus) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      CustomAlert.alert(
        newFollowStatus ? 'Following' : 'Unfollowed',
        newFollowStatus ? 'You are now following this user' : 'You unfollowed this user',
        undefined,
        newFollowStatus ? 'success' : 'info'
      );
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      CustomAlert.alert('Error', error.message || 'Failed to update follow status', undefined, 'error');
    }
  };

  const handleUserPress = (user: any) => {
    onUserSelect?.(user);
  };

  const handleChatPress = (user: any) => {
    onUserSelect(user);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Users</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Results */}
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Searching users...</Text>
            </View>
          ) : users.length === 0 && searchQuery.trim() ? (
            <View style={styles.centerContent}>
              <Ionicons name="person-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>Try searching with a different name</Text>
            </View>
          ) : searchQuery.trim() === '' ? (
            <View style={styles.centerContent}>
              <Ionicons name="search-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Search for users</Text>
              <Text style={styles.emptySubtitle}>Enter a name to find users</Text>
            </View>
          ) : (
            users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => handleUserPress(user)}
              >
                <View style={styles.userAvatar}>
                  {user.profile_pic ? (
                    <Image source={{ uri: user.profile_pic }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person-outline" size={30} color={COLORS.textLight} />
                  )}
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userStats}>
                    <Text style={styles.statText}>
                      {user.items?.[0]?.count || 0} items
                    </Text>
                    <Text style={styles.statText}>
                      {user.followers?.[0]?.count || 0} followers
                    </Text>
                    <Text style={styles.statText}>
                      {user.following?.[0]?.count || 0} following
                    </Text>
                  </View>
                </View>

                <View style={styles.userActions}>
                  {user.id !== currentUser?.id && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.followButton,
                          followingUsers.has(user.id) && styles.followingButton
                        ]}
                        onPress={() => handleFollowToggle(user.id)}
                      >
                        <Text style={[
                          styles.followButtonText,
                          followingUsers.has(user.id) && styles.followingButtonText
                        ]}>
                          {followingUsers.has(user.id) ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => handleChatPress(user)}
                      >
                        <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.light,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  followingButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
  },
  followingButtonText: {
    color: COLORS.primary,
  },
  chatButton: {
    padding: SPACING.sm,
  },
});

export default UserSearchModal;

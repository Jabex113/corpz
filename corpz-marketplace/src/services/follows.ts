import { supabase } from './supabase';

export const followsService = {
  async followUser(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (user.id === userId) {
      throw new Error('Cannot follow yourself');
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: userId,
      })
      .select()
      .single();

    if (error) {
      // If it's a duplicate error, ignore it
      if (error.code === '23505') {
        return null; // Already following
      }
      throw error;
    }
    return data;
  },

  async unfollowUser(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) throw error;
  },

  async isFollowing(userId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error);
      return false;
    }

    return !!data;
  },

  async toggleFollow(userId: string): Promise<boolean> {
    const isFollowingUser = await this.isFollowing(userId);
    
    if (isFollowingUser) {
      await this.unfollowUser(userId);
      return false;
    } else {
      await this.followUser(userId);
      return true;
    }
  },

  async getFollowers(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        users!follows_follower_id_fkey(id, name, profile_pic)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }

    return data?.map(follow => follow.users).filter(Boolean) || [];
  },

  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        users!follows_following_id_fkey(id, name, profile_pic)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching following:', error);
      throw error;
    }

    return data?.map(follow => follow.users).filter(Boolean) || [];
  },

  async getFollowCounts(userId: string) {
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', userId)
    ]);

    return {
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
    };
  },
};

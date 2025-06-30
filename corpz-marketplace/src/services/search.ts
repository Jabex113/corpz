import { supabase } from './supabase';

export const searchService = {
  async searchProducts(query: string) {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async searchUsers(query: string) {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        profile_pic,
        created_at,
        items:items(count),
        followers:follows!follows_following_id_fkey(count),
        following:follows!follows_follower_id_fkey(count)
      `)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  async getProductsByCategory(category: string) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('items')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;
    
    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories.filter(Boolean);
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        profile_pic,
        created_at,
        items:items(*),
        followers:follows!follows_following_id_fkey(
          follower:users(id, name, profile_pic)
        ),
        following:follows!follows_follower_id_fkey(
          following:users(id, name, profile_pic)
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },
};

import { supabase } from './supabase';

export const favoritesService = {
  async addToFavorites(itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        item_id: itemId,
      })
      .select()
      .single();

    if (error) {
      // If it's a duplicate error, ignore it
      if (error.code === '23505') {
        return null; // Already in favorites
      }
      throw error;
    }
    return data;
  },

  async removeFromFavorites(itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (error) throw error;
  },

  async getFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        item:items(
          id,
          title,
          description,
          price,
          image_url,
          stock,
          category,
          seller:users(id, name, profile_pic)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isFavorite(itemId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking favorite status:', error);
      return false;
    }

    return !!data;
  },

  async toggleFavorite(itemId: string): Promise<boolean> {
    const isFav = await this.isFavorite(itemId);
    
    if (isFav) {
      await this.removeFromFavorites(itemId);
      return false;
    } else {
      await this.addToFavorites(itemId);
      return true;
    }
  },

  async getFavoriteIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorite IDs:', error);
      return [];
    }

    return data.map(fav => fav.item_id);
  },
};

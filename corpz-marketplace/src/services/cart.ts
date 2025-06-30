import { supabase } from './supabase';
import { Database } from './supabase';

type CartInsert = Database['public']['Tables']['cart']['Insert'];
type CartUpdate = Database['public']['Tables']['cart']['Update'];

export const cartService = {
  async addToCart(itemId: string, quantity: number = 1) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingItem) {
      // Update quantity if item already in cart
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Add new item to cart
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: user.id,
          item_id: itemId,
          quantity,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getCartItems() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        item:items(
          id,
          title,
          description,
          price,
          image_url,
          stock,
          seller:users(id, name, profile_pic)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCart(cartItemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getCartCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('cart')
      .select('quantity')
      .eq('user_id', user.id);

    if (error) return 0;
    return data.reduce((total, item) => total + item.quantity, 0);
  },
};

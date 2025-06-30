import { supabase } from './supabase';
import { Database } from './supabase';
import { ValidationUtils } from '../utils/validation';

type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

export const itemsService = {
  async createItem(item: Omit<ItemInsert, 'id' | 'seller_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate and sanitize inputs
    const sanitizedItem = {
      title: ValidationUtils.sanitizeTextInput(item.title, 100),
      description: ValidationUtils.sanitizeTextInput(item.description, 1000),
      price: item.price,
      stock: item.stock,
      category: ValidationUtils.sanitizeTextInput(item.category || 'Other', 50),
      image_url: item.image_url,
    };

    // Validation checks
    if (!sanitizedItem.title || sanitizedItem.title.length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (!sanitizedItem.description || sanitizedItem.description.length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    if (!sanitizedItem.price || sanitizedItem.price <= 0 || sanitizedItem.price > 1000000) {
      throw new Error('Price must be between ₱0.01 and ₱1,000,000');
    }

    if (sanitizedItem.stock < 0 || sanitizedItem.stock > 10000) {
      throw new Error('Stock must be between 0 and 10,000');
    }

    // Validate image if provided
    if (sanitizedItem.image_url) {
      if (!sanitizedItem.image_url.startsWith('data:image/')) {
        throw new Error('Invalid image format');
      }
    }

    const { data, error } = await supabase
      .from('items')
      .insert({
        ...sanitizedItem,
        seller_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllItems() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getItemsByCategory(category: string) {
    // Sanitize category input
    const sanitizedCategory = ValidationUtils.sanitizeTextInput(category, 50);

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .eq('category', sanitizedCategory)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getItemsBySeller(sellerId: string) {
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sellerId)) {
      throw new Error('Invalid seller ID');
    }

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getItemById(itemId: string) {
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(itemId)) {
      throw new Error('Invalid item ID');
    }

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(itemId: string, updates: ItemUpdate) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(itemId)) {
      throw new Error('Invalid item ID');
    }

    // Sanitize updates
    const sanitizedUpdates: ItemUpdate = {};

    if (updates.title) {
      sanitizedUpdates.title = ValidationUtils.sanitizeTextInput(updates.title, 100);
      if (sanitizedUpdates.title.length < 3) {
        throw new Error('Title must be at least 3 characters long');
      }
    }

    if (updates.description) {
      sanitizedUpdates.description = ValidationUtils.sanitizeTextInput(updates.description, 1000);
      if (sanitizedUpdates.description.length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }
    }

    if (updates.price !== undefined) {
      if (updates.price <= 0 || updates.price > 1000000) {
        throw new Error('Price must be between ₱0.01 and ₱1,000,000');
      }
      sanitizedUpdates.price = updates.price;
    }

    if (updates.stock !== undefined) {
      if (updates.stock < 0 || updates.stock > 10000) {
        throw new Error('Stock must be between 0 and 10,000');
      }
      sanitizedUpdates.stock = updates.stock;
    }

    if (updates.category) {
      sanitizedUpdates.category = ValidationUtils.sanitizeTextInput(updates.category, 50);
    }

    if (updates.image_url) {
      if (!updates.image_url.startsWith('data:image/')) {
        throw new Error('Invalid image format');
      }
      sanitizedUpdates.image_url = updates.image_url;
    }

    if (updates.updated_at) {
      sanitizedUpdates.updated_at = updates.updated_at;
    }

    const { data, error } = await supabase
      .from('items')
      .update(sanitizedUpdates)
      .eq('id', itemId)
      .eq('seller_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(itemId)) {
      throw new Error('Invalid item ID');
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('seller_id', user.id);

    if (error) throw error;
  },

  async searchItems(searchTerm: string) {
    // Sanitize search term
    const sanitizedSearchTerm = ValidationUtils.sanitizeTextInput(searchTerm, 100);
    
    if (sanitizedSearchTerm.length < 2) {
      throw new Error('Search term must be at least 2 characters');
    }

    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:users(id, name, profile_pic)
      `)
      .or(`title.ilike.%${sanitizedSearchTerm}%,description.ilike.%${sanitizedSearchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async uploadItemImage(uri: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate image file
    const validation = ValidationUtils.validateImageFile(uri);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Security checks
      if (!blob.type.startsWith('image/')) {
        throw new Error('File is not a valid image');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (blob.size > maxSize) {
        throw new Error('Image must be smaller than 5MB');
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          
          // Validate base64 format
          if (!result.startsWith('data:image/')) {
            reject(new Error('Invalid image format'));
            return;
          }
          
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return base64;
    } catch (error) {
      console.error('Failed to upload item image:', error);
      throw new Error('Failed to upload item image');
    }
  },
};
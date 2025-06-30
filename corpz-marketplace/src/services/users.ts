import { supabase } from './supabase';
import { Database } from './supabase';
import { ValidationUtils } from '../utils/validation';

type UserUpdate = Database['public']['Tables']['users']['Update'];

export const usersService = {
  async getUserProfile(userId?: string) {
    const query = userId 
      ? supabase.from('users').select('*').eq('id', userId)
      : supabase.from('users').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id || '');

    const { data, error } = await query.single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(updates: Partial<UserUpdate>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // sanitize
    const sanitizedUpdates: Partial<UserUpdate> = {};
    
    if (updates.name) {
      const nameValidation = ValidationUtils.validateName(updates.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error);
      }
      sanitizedUpdates.name = nameValidation.sanitized;
    }

    if (updates.profile_pic) {
      sanitizedUpdates.profile_pic = updates.profile_pic;
    }

    // Copy other valid fields
    if (updates.email) {
      const emailValidation = ValidationUtils.validateEmail(updates.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
      }
      sanitizedUpdates.email = updates.email.trim().toLowerCase();
    }

    if (updates.updated_at) {
      sanitizedUpdates.updated_at = updates.updated_at;
    }

    const { data, error } = await supabase
      .from('users')
      .update(sanitizedUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadProfilePicture(uri: string, fileSize?: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    //  image file
    const validation = ValidationUtils.validateImageFile(uri, fileSize);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // For now, use base64 storage directly since it's simpler and doesnt require bucket setup
    return await this.uploadProfilePictureAsBase64(uri);

    // TODO: Uncomment below when Supabase storage bucket is set up
    /*
    try {
      // Try to upload to Supabase storage first
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const filePath = `profile-pictures/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      // Additional security: Check actual file type from blob
      if (!blob.type.startsWith('image/')) {
        throw new Error('File is not a valid image');
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload failed, falling back to base64:', uploadError);
        // Fallback: convert to base64 and store directly
        return await this.uploadProfilePictureAsBase64(uri);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await this.updateProfile({ profile_pic: publicUrl });
      return publicUrl;
    } catch (error) {
      console.warn('Storage upload failed, falling back to base64:', error);
      // Fallback: convert to base64 and store directly
      return await this.uploadProfilePictureAsBase64(uri);
    }
    */
  },

  async uploadProfilePictureAsBase64(uri: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Security check: Verify it's actually an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('File is not a valid image');
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (blob.size > maxSize) {
        throw new Error('Image must be smaller than 5MB');
      }

      // blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          
          // Additional security: Validate base64 format
          if (!result.startsWith('data:image/')) {
            reject(new Error('Invalid image format'));
            return;
          }
          
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await this.updateProfile({ profile_pic: base64 });
      return base64;
    } catch (error) {
      console.error('Failed to upload profile picture as base64:', error);
      throw new Error('Failed to upload profile picture');
    }
  },

  async searchUsers(searchTerm: string) {
    // Sanitize search term
    const sanitizedSearchTerm = ValidationUtils.sanitizeTextInput(searchTerm, 50);
    
    if (sanitizedSearchTerm.length < 2) {
      throw new Error('Search term must be at least 2 characters');
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${sanitizedSearchTerm}%,email.ilike.%${sanitizedSearchTerm}%`)
      .limit(10);

    if (error) throw error;
    return data;
  },
}; 
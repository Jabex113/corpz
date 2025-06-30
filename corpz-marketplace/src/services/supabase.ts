import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}


const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          profile_pic?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          profile_pic?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          profile_pic?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          image_url?: string;
          stock: number;
          category?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          image_url?: string;
          stock: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          price?: number;
          image_url?: string;
          stock?: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          timestamp: string;
          read: boolean;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          message: string;
          timestamp?: string;
          read?: boolean;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          message?: string;
          timestamp?: string;
          read?: boolean;
        };
      };
      cart: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          amount: number;
          payment_method: 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
          payment_reference: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          amount: number;
          payment_method: 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
          payment_reference: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          amount?: number;
          payment_method?: 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
          payment_reference?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          item_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          quantity: number;
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          quantity: number;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          buyer_id?: string;
          seller_id?: string;
          amount?: number;
          quantity?: number;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

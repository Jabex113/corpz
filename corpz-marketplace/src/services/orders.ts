import { supabase } from './supabase';
import { Database } from './supabase';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export const ordersService = {
  async createOrder(itemId: string, quantity: number = 1) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) throw itemError;
    if (!item) throw new Error('Item not found');
    
    if (item.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const amount = item.price * quantity;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        item_id: itemId,
        buyer_id: user.id,
        seller_id: item.seller_id,
        amount,
        quantity,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    await supabase
      .from('items')
      .update({ stock: item.stock - quantity })
      .eq('id', itemId);

    return order;
  },

  async getMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        item:items(id, title, description, price, image_url),
        buyer:users!orders_buyer_id_fkey(id, name, profile_pic),
        seller:users!orders_seller_id_fkey(id, name, profile_pic)
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMySales() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        item:items(id, title, description, price, image_url),
        buyer:users!orders_buyer_id_fkey(id, name, profile_pic),
        seller:users!orders_seller_id_fkey(id, name, profile_pic)
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelOrder(orderId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, item:items(stock)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Order not found');
    
    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be cancelled');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('items')
      .update({ stock: order.item.stock + order.quantity })
      .eq('id', order.item_id);

    return data;
  },

  async getOrderStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: sales, error: salesError } = await supabase
      .from('orders')
      .select('amount, status')
      .eq('seller_id', user.id);

    if (salesError) throw salesError;

    const stats = {
      totalSales: sales?.filter(s => s.status !== 'cancelled').length || 0,
      totalRevenue: sales?.filter(s => s.status !== 'cancelled')
        .reduce((sum, sale) => sum + Number(sale.amount), 0) || 0,
      pendingOrders: sales?.filter(s => s.status === 'pending').length || 0,
      completedOrders: sales?.filter(s => s.status === 'delivered').length || 0,
    };

    return stats;
  },

  async getEarningsHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        created_at,
        item:items(title)
      `)
      .eq('seller_id', user.id)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
}; 
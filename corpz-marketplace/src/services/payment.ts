import { supabase } from './supabase';
import { ordersService } from './orders';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'gcash' | 'paymaya' | 'bank_transfer';
  name: string;
  icon: string;
  description: string;
}

export interface PaymentDetails {
  itemId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'gcash',
    type: 'gcash',
    name: 'GCash',
    icon: 'phone-portrait-outline',
    description: 'Pay with GCash mobile wallet',
  },
  {
    id: 'paymaya',
    type: 'paymaya',
    name: 'PayMaya',
    icon: 'card-outline',
    description: 'Pay with PayMaya digital wallet',
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: 'card-outline',
    description: 'Pay with Visa, Mastercard, or other cards',
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    icon: 'business-outline',
    description: 'Direct bank transfer',
  },
];

export const paymentService = {
  async processPayment(paymentDetails: PaymentDetails): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate item availability and stock
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', paymentDetails.itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) throw new Error('Item not found');
      
      if (item.stock < paymentDetails.quantity) {
        throw new Error('Insufficient stock available');
      }

      // Simulate payment processing based on payment method
      const paymentResult = await this.simulatePaymentGateway(paymentDetails);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Create order after successful payment
      const order = await ordersService.createOrder(paymentDetails.itemId, paymentDetails.quantity);

      // Store payment record (you can create a payments table for this)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          user_id: user.id,
          amount: paymentDetails.totalAmount,
          payment_method: paymentDetails.paymentMethod.type,
          payment_reference: paymentResult.transactionId,
          status: 'completed',
        });

      if (paymentError) {
        console.warn('Failed to store payment record:', paymentError);
        // Don't throw error here as the order was already created
      }

      return {
        success: true,
        orderId: order.id,
      };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  },

  async simulatePaymentGateway(paymentDetails: PaymentDetails): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different payment method behaviors
    switch (paymentDetails.paymentMethod.type) {
      case 'gcash':
        // Simulate GCash payment
        if (Math.random() > 0.1) { // 90% success rate
          return {
            success: true,
            transactionId: `GCASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
        } else {
          return {
            success: false,
            error: 'GCash payment failed. Please check your balance and try again.',
          };
        }

      case 'paymaya':
        // Simulate PayMaya payment
        if (Math.random() > 0.05) { // 95% success rate
          return {
            success: true,
            transactionId: `PAYMAYA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
        } else {
          return {
            success: false,
            error: 'PayMaya payment failed. Please try again.',
          };
        }

      case 'card':
        // Simulate card payment
        if (Math.random() > 0.08) { // 92% success rate
          return {
            success: true,
            transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
        } else {
          return {
            success: false,
            error: 'Card payment declined. Please check your card details.',
          };
        }

      case 'bank_transfer':
        // Bank transfer processing
        return {
          success: true,
          transactionId: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

      default:
        return {
          success: false,
          error: 'Unsupported payment method',
        };
    }
  },

  getPaymentMethods(): PaymentMethod[] {
    return paymentMethods;
  },

  async getPaymentHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(
          id,
          quantity,
          status,
          item:items(id, title, image_url, price)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

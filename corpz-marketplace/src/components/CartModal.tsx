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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlert } from './CustomAlert';
import { cartService } from '../services/cart';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  onCartUpdate?: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ visible, onClose, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      fetchCartItems();
    }
  }, [visible]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const items = await cartService.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      CustomAlert.alert('Error', 'Failed to load cart items', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      await cartService.updateCartItemQuantity(cartItemId, newQuantity);
      await fetchCartItems();
      onCartUpdate?.();
    } catch (error) {
      console.error('Error updating quantity:', error);
      CustomAlert.alert('Error', 'Failed to update quantity', undefined, 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(cartItemId));
      await cartService.removeFromCart(cartItemId);
      await fetchCartItems();
      onCartUpdate?.();
      CustomAlert.alert('Removed', 'Item removed from cart', undefined, 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      CustomAlert.alert('Error', 'Failed to remove item', undefined, 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, cartItem) => {
      return total + (cartItem.item?.price || 0) * cartItem.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading cart...</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some items to get started!</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
              {cartItems.map((cartItem) => (
                <View key={cartItem.id} style={styles.cartItem}>
                  <View style={styles.itemImage}>
                    {cartItem.item?.image_url ? (
                      <Image source={{ uri: cartItem.item.image_url }} style={styles.productImage} />
                    ) : (
                      <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
                    )}
                  </View>
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {cartItem.item?.title || 'Unknown Item'}
                    </Text>
                    <Text style={styles.itemPrice}>₱{cartItem.item?.price || 0}</Text>
                    <Text style={styles.itemSeller}>
                      by {cartItem.item?.seller?.name || 'Unknown Seller'}
                    </Text>
                  </View>

                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      disabled={updatingItems.has(cartItem.id) || cartItem.quantity <= 1}
                    >
                      <Ionicons 
                        name="remove" 
                        size={16} 
                        color={cartItem.quantity <= 1 ? COLORS.textLight : COLORS.text} 
                      />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>
                      {updatingItems.has(cartItem.id) ? '...' : cartItem.quantity}
                    </Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      disabled={updatingItems.has(cartItem.id)}
                    >
                      <Ionicons name="add" size={16} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(cartItem.id)}
                    disabled={updatingItems.has(cartItem.id)}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={20} 
                      color={updatingItems.has(cartItem.id) ? COLORS.textLight : COLORS.error} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Cart Summary */}
            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items:</Text>
                <Text style={styles.summaryValue}>{getTotalItems()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₱{getTotalAmount().toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
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
  cartList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.light,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  itemSeller: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  quantityButton: {
    padding: SPACING.sm,
  },
  quantityText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: SPACING.sm,
  },
  cartSummary: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  totalLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  totalAmount: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  checkoutButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
});

export default CartModal;

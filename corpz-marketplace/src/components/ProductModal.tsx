import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlert } from './CustomAlert';
import PaymentModal from './PaymentModal';
import { cartService } from '../services/cart';
import { favoritesService } from '../services/favorites';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
}

const ProductModal: React.FC<ProductModalProps> = ({ visible, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    if (visible && product) {
      checkFavoriteStatus();
    }
  }, [visible, product]);

  const checkFavoriteStatus = async () => {
    try {
      const isFav = await favoritesService.isFavorite(product.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setIsTogglingFavorite(true);
      const newFavoriteStatus = await favoritesService.toggleFavorite(product.id);
      setIsFavorite(newFavoriteStatus);

      CustomAlert.alert(
        newFavoriteStatus ? 'Added to Favorites' : 'Removed from Favorites',
        newFavoriteStatus
          ? `${product.title} has been added to your favorites`
          : `${product.title} has been removed from your favorites`,
        undefined,
        newFavoriteStatus ? 'success' : 'info'
      );
    } catch (error: any) {
      let errorMessage = 'Failed to update favorites';

      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to add items to favorites';
      }

      CustomAlert.alert('Error', errorMessage, undefined, 'error');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      CustomAlert.alert('Out of Stock', 'This item is currently out of stock', undefined, 'error');
      return;
    }

    try {
      setIsAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      CustomAlert.alert('Added to Cart', `${quantity} ${product.title} added to cart`, undefined, 'success');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      let errorMessage = 'Failed to add item to cart';

      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Please log in to add items to cart';
      }

      CustomAlert.alert('Error', errorMessage, undefined, 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      CustomAlert.alert('Out of Stock', 'This item is currently out of stock', undefined, 'error');
      return;
    }

    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (orderId: string) => {
    CustomAlert.alert(
      'Order Placed Successfully!',
      `Your order has been placed. Order ID: ${orderId}`,
      [{ text: 'OK', onPress: onClose }],
      'success'
    );
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {!product ? (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : (() => {
        // Support multiple images - check if product has multiple images stored
        const images = [];
        if (product.image_url) {
          images.push(product.image_url);
        }
        // If product has additional images stored (for future use)
        if (product.images && Array.isArray(product.images)) {
          images.push(...product.images);
        }

        // Rating data
        const rating = product.rating || 0;
        const ratingCount = product.rating_count || 0;

        return (
          <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleToggleFavorite}
                disabled={isTogglingFavorite}
              >
                {isTogglingFavorite ? (
                  <ActivityIndicator size="small" color={COLORS.text} />
                ) : (
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorite ? COLORS.error : COLORS.text}
                  />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Images */}
              <View style={styles.imageSection}>
                {images.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    pagingEnabled 
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                      setCurrentImageIndex(index);
                    }}
                  >
                    {images.map((image, index) => (
                      <Image key={index} source={{ uri: image }} style={styles.productImage} />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={60} color={COLORS.textLight} />
                  </View>
                )}
                
                {images.length > 1 && (
                  <View style={styles.imageIndicators}>
                    {images.map((_, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.indicator,
                          index === currentImageIndex && styles.activeIndicator
                        ]} 
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productPrice}>₱{product.price}</Text>
                
                {/* Rating */}
                {rating > 0 && (
                  <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.floor(rating) ? "star" : star <= rating ? "star-half" : "star-outline"}
                          size={16}
                          color={COLORS.warning}
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingText}>
                      {rating.toFixed(1)} ({ratingCount} review{ratingCount !== 1 ? 's' : ''})
                    </Text>
                  </View>
                )}

                {/* Seller Info */}
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerLabel}>Sold by:</Text>
                  <Text style={styles.sellerName}>{product.seller?.name || 'Unknown Seller'}</Text>
                </View>

                {/* Stock */}
                <Text style={styles.stockText}>
                  {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
                </Text>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{product.description}</Text>
                </View>

                {/* Category */}
                {product.category && (
                  <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>Category</Text>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            {product.stock > 0 && (
              <View style={styles.bottomActions}>
                {/* Quantity Selector */}
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.textLight : COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Ionicons name="add" size={20} color={quantity >= product.stock ? COLORS.textLight : COLORS.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.addToCartButton, isAddingToCart && styles.buttonDisabled]}
                    onPress={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
                    )}
                    <Text style={styles.addToCartText}>
                      {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                    <Text style={styles.buyNowText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Payment Modal */}
            <PaymentModal
              visible={paymentModalVisible}
              onClose={() => setPaymentModalVisible(false)}
              product={product}
              quantity={quantity}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </SafeAreaView>
        );
      })()}
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
  favoriteButton: {
    padding: SPACING.sm,
  },
  imageSection: {
    position: 'relative',
  },
  productImage: {
    width: screenWidth,
    height: 300,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: screenWidth,
    height: 300,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
  },
  productInfo: {
    padding: SPACING.lg,
  },
  productTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  productPrice: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  ratingText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sellerLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  sellerName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  stockText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  descriptionSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryTag: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  bottomActions: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quantityLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
  },
  quantityButton: {
    padding: SPACING.sm,
  },
  quantityText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addToCartText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ProductModal;

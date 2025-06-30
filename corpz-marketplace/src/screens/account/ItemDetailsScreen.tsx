import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlert } from '../../components/CustomAlert';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
  route: {
    params: {
      item: any;
    };
  };
}

const ItemDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleBuyNow = () => {
    if (item.stock <= 0) {
      CustomAlert.alert('Out of Stock', 'This item is currently out of stock', undefined, 'error');
      return;
    }
    
    CustomAlert.alert('Purchase', 'Buy now functionality will be implemented soon', undefined, 'info');
  };

  const handleAddToCart = () => {
    if (item.stock <= 0) {
      CustomAlert.alert('Out of Stock', 'This item is currently out of stock', undefined, 'error');
      return;
    }
    
    CustomAlert.alert('Added to Cart', 'Item added to cart (feature coming soon)', undefined, 'success');
  };

  const handleMessageSeller = () => {
    CustomAlert.alert('Message Seller', 'Messaging feature will be implemented soon', undefined, 'info');
  };

  const incrementQuantity = () => {
    if (quantity < item.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? COLORS.error : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Ionicons name="image-outline" size={100} color={COLORS.textLight} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>₱{item.price}</Text>
          
          <View style={styles.stockContainer}>
            <Text style={styles.stockText}>
              Stock: {item.stock} {item.stock <= 5 && item.stock > 0 ? '(Low stock!)' : ''}
            </Text>
            {item.stock <= 0 && (
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            )}
          </View>

          <View style={styles.sellerContainer}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.textSecondary} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{item.seller?.name || 'Unknown Seller'}</Text>
              <Text style={styles.sellerLabel}>Seller</Text>
            </View>
            <TouchableOpacity style={styles.messageButton} onPress={handleMessageSeller}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {item.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          )}

          {item.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.textLight : COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                  disabled={quantity >= item.stock}
                >
                  <Ionicons name="add" size={20} color={quantity >= item.stock ? COLORS.textLight : COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {item.stock > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  },
  backButton: {
    padding: SPACING.sm,
  },
  favoriteButton: {
    padding: SPACING.sm,
  },
  imageContainer: {
    height: 250,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  stockContainer: {
    marginBottom: SPACING.lg,
  },
  stockText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  outOfStockText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  sellerName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  sellerLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  messageButton: {
    padding: SPACING.sm,
  },
  descriptionContainer: {
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
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  category: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  quantityContainer: {
    marginBottom: SPACING.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignSelf: 'flex-start',
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.light,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
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
    marginLeft: SPACING.sm,
  },
  buyNowText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});

export default ItemDetailsScreen; 
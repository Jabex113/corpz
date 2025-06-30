import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../store/AuthContext';
import { itemsService } from '../../services/items';
import { CustomAlert } from '../../components/CustomAlert';
import ProductModal from '../../components/ProductModal';
import CartModal from '../../components/CartModal';
import UserSearchModal from '../../components/UserSearchModal';
import ProductSearchModal from '../../components/ProductSearchModal';
import { cartService } from '../../services/cart';
import { searchService } from '../../services/search';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userSearchModalVisible, setUserSearchModalVisible] = useState(false);
  const [productSearchModalVisible, setProductSearchModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryList = [
    { id: '1', name: 'Electronics', icon: 'phone-portrait-outline', color: '#3B82F6' },
    { id: '2', name: 'Fashion', icon: 'shirt-outline', color: '#EC4899' },
    { id: '3', name: 'Home', icon: 'home-outline', color: '#10B981' },
    { id: '4', name: 'Sports', icon: 'basketball-outline', color: '#F59E0B' },
    { id: '5', name: 'Books', icon: 'book-outline', color: '#8B5CF6' },
    { id: '6', name: 'Other', icon: 'grid-outline', color: '#6B7280' },
  ];

  const fetchItems = async () => {
    try {
      const data = await itemsService.getAllItems();
      setItems(data || []);
    } catch (error) {
      CustomAlert.alert('Error', 'Failed to load items', undefined, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Refresh items when screen comes into focus (e.g., after posting a new item)
  useFocusEffect(
    useCallback(() => {
      fetchItems();
      fetchCartCount();
    }, [])
  );

  const fetchCartCount = async () => {
    try {
      const count = await cartService.getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleCartPress = () => {
    setCartModalVisible(true);
  };

  const handleProductSearchPress = () => {
    setProductSearchModalVisible(true);
  };

  const handleUserSearchPress = () => {
    setUserSearchModalVisible(true);
  };

  const handleCategoryPress = async (categoryName: string) => {
    try {
      setSelectedCategory(categoryName);
      const categoryItems = await searchService.getProductsByCategory(categoryName);
      setItems(categoryItems);
    } catch (error) {
      console.error('Error fetching category items:', error);
      CustomAlert.alert('Error', 'Failed to load category items', undefined, 'error');
    }
  };

  const handleShowAllItems = () => {
    setSelectedCategory(null);
    fetchItems();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleItemPress = (item: any) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading items...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.searchContainer} onPress={handleProductSearchPress}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.searchPlaceholder}>Search products...</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>



        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <TouchableOpacity
              style={[styles.categoryCard, !selectedCategory && styles.selectedCategoryCard]}
              onPress={handleShowAllItems}
            >
              <View style={[styles.categoryIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="apps-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={[styles.categoryName, !selectedCategory && styles.selectedCategoryName]}>All</Text>
            </TouchableOpacity>
            {categoryList.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, selectedCategory === category.name && styles.selectedCategoryCard]}
                onPress={() => handleCategoryPress(category.name)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                <Text style={[styles.categoryName, selectedCategory === category.name && styles.selectedCategoryName]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Items</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No items available yet</Text>
              <Text style={styles.emptySubtext}>Be the first to post an item!</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.productCard}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.productImageContainer}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.productImage} />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={32} color={COLORS.textLight} />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.productPrice}>₱{item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Post')}
            >
              <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Sell Item</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Earnings')}
            >
              <Ionicons name="wallet-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>My Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Messages')}
            >
              <Ionicons name="chatbubbles-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Product Modal */}
      <ProductModal
        visible={modalVisible}
        onClose={handleCloseModal}
        product={selectedProduct}
      />

      {/* Cart Modal */}
      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        onCartUpdate={fetchCartCount}
      />

      {/* User Search Modal */}
      <UserSearchModal
        visible={userSearchModalVisible}
        onClose={() => setUserSearchModalVisible(false)}
        onUserSelect={(user) => {
          setUserSearchModalVisible(false);
          CustomAlert.alert('User Selected', `You selected ${user.name}`, undefined, 'info');
        }}
      />

      {/* Product Search Modal */}
      <ProductSearchModal
        visible={productSearchModalVisible}
        onClose={() => setProductSearchModalVisible(false)}
        onProductSelect={(product) => {
          setSelectedProduct(product);
          setModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  cartButton: {
    padding: SPACING.sm,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.white,
  },
  selectedCategoryCard: {
    backgroundColor: COLORS.primary + '10',
  },
  selectedCategoryName: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },

  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  categoriesContainer: {
    paddingLeft: SPACING.lg,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 80,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'transparent',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  productPrice: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  favoriteButton: {
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
  },
  actionCard: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    width: 100,
  },
  actionText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  itemStock: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default HomeScreen;

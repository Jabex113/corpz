import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CustomAlert } from './CustomAlert';
import FloatingInput from './FloatingInput';
import { paymentService, PaymentMethod, PaymentDetails } from '../services/payment';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
  quantity: number;
  onPaymentSuccess: (orderId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  visible, 
  onClose, 
  product, 
  quantity, 
  onPaymentSuccess 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  if (!product) return null;

  const totalAmount = product.price * quantity;
  const paymentMethods = paymentService.getPaymentMethods();

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      CustomAlert.alert('Payment Method Required', 'Please select a payment method', undefined, 'warning');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      CustomAlert.alert('Shipping Address Required', 'Please fill in all shipping address fields', undefined, 'warning');
      return;
    }

    try {
      setIsProcessing(true);

      const paymentDetails: PaymentDetails = {
        itemId: product.id,
        quantity,
        totalAmount,
        paymentMethod: selectedPaymentMethod,
        shippingAddress,
      };

      const result = await paymentService.processPayment(paymentDetails);

      if (result.success && result.orderId) {
        CustomAlert.alert(
          'Payment Successful!',
          `Your order has been placed successfully. Order ID: ${result.orderId}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onPaymentSuccess(result.orderId!);
                onClose();
              }
            }
          ],
          'success'
        );
      } else {
        CustomAlert.alert('Payment Failed', result.error || 'Payment processing failed', undefined, 'error');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      CustomAlert.alert('Payment Error', error.message || 'An error occurred during payment', undefined, 'error');
    } finally {
      setIsProcessing(false);
    }
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
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderItem}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productDetails}>Quantity: {quantity}</Text>
              <Text style={styles.productDetails}>Price: ₱{product.price} each</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>₱{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <FloatingInput
              label="Full Name *"
              value={shippingAddress.fullName}
              onChangeText={(text: string) => setShippingAddress(prev => ({ ...prev, fullName: text }))}
              placeholder="Enter your full name"
              containerStyle={styles.input}
            />
            <FloatingInput
              label="Address *"
              value={shippingAddress.address}
              onChangeText={(text: string) => setShippingAddress(prev => ({ ...prev, address: text }))}
              placeholder="Enter your address"
              containerStyle={styles.input}
            />
            <FloatingInput
              label="City *"
              value={shippingAddress.city}
              onChangeText={(text: string) => setShippingAddress(prev => ({ ...prev, city: text }))}
              placeholder="Enter your city"
              containerStyle={styles.input}
            />
            <FloatingInput
              label="Postal Code"
              value={shippingAddress.postalCode}
              onChangeText={(text: string) => setShippingAddress(prev => ({ ...prev, postalCode: text }))}
              placeholder="Enter postal code"
              containerStyle={styles.input}
            />
            <FloatingInput
              label="Phone Number"
              value={shippingAddress.phone}
              onChangeText={(text: string) => setShippingAddress(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              containerStyle={styles.input}
            />
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <View style={styles.paymentMethodContent}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={24} 
                    color={selectedPaymentMethod?.id === method.id ? COLORS.primary : COLORS.text} 
                  />
                  <View style={styles.paymentMethodText}>
                    <Text style={[
                      styles.paymentMethodName,
                      selectedPaymentMethod?.id === method.id && styles.selectedText
                    ]}>
                      {method.name}
                    </Text>
                    <Text style={styles.paymentMethodDescription}>
                      {method.description}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod?.id === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPaymentMethod?.id === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <View style={styles.totalSummary}>
            <Text style={styles.totalSummaryLabel}>Total Amount:</Text>
            <Text style={styles.totalSummaryAmount}>₱{totalAmount.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
          </TouchableOpacity>
        </View>
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
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  orderItem: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  productTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productDetails: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  totalAmount: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
  input: {
    marginBottom: SPACING.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundSecondary,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  paymentMethodName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.primary,
  },
  paymentMethodDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  bottomActions: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  totalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalSummaryLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  totalSummaryAmount: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
  },
});

export default PaymentModal;

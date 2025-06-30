import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../store/AuthContext';
import { RootStackParamList } from '../types';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import LoadingScreen from '../screens/LoadingScreen';

// Account screens
import MyListingsScreen from '../screens/account/MyListingsScreen';
import PurchaseHistoryScreen from '../screens/account/PurchaseHistoryScreen';
import FavoritesScreen from '../screens/account/FavoritesScreen';
import PaymentMethodsScreen from '../screens/account/PaymentMethodsScreen';
import ShippingAddressScreen from '../screens/account/ShippingAddressScreen';
import NotificationsScreen from '../screens/account/NotificationsScreen';
import PrivacySecurityScreen from '../screens/account/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/account/HelpSupportScreen';
import AboutScreen from '../screens/account/AboutScreen';
import EditProfileScreen from '../screens/account/EditProfileScreen';
import ItemDetailsScreen from '../screens/account/ItemDetailsScreen';
import FollowersScreen from '../screens/account/FollowersScreen';
import FollowingScreen from '../screens/account/FollowingScreen';

// Chat screens
import ChatScreen from '../screens/chat/ChatScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="MyListings" component={MyListingsScreen} />
          <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
          <Stack.Screen name="Followers" component={FollowersScreen} />
          <Stack.Screen name="Following" component={FollowingScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

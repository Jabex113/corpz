import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { COLORS, FONTS, FONT_SIZES, SHADOWS } from '../constants/theme';

import HomeScreen from '../screens/main/HomeScreen';
import PostScreen from '../screens/main/PostScreen';
import EarningsScreen from '../screens/main/EarningsScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import AccountScreen from '../screens/main/AccountScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconColor = focused ? COLORS.primary : COLORS.textLight;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Post':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              iconColor = focused ? COLORS.accent : COLORS.textLight;
              break;
            case 'Earnings':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          // Special styling for Post tab
          if (route.name === 'Post') {
            return (
              <View style={{
                backgroundColor: focused ? COLORS.accent + '20' : 'transparent',
                borderRadius: 20,
                padding: 8,
                marginTop: -5,
              }}>
                <Ionicons name={iconName} size={size + 2} color={iconColor} />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          height: Platform.OS === 'ios' ? 85 : 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          ...SHADOWS.medium,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: FONT_SIZES.xs,
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

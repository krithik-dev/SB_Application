// src/navigation/BottomTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearnScreen from '../screens/LearnScreen';
import AiMentorScreen from '../screens/AiMentorScreen';
import CertificationScreen from '../screens/CertificationScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const THEME_COLOR = '#7C3AED';

export default function BottomTabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // ✅ Always hide top header bar
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            switch (route.name) {
              case 'Learn':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case 'AI Mentor':
                iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                break;
              case 'Streams':
                iconName = focused ? 'tv' : 'tv-outline';
                break;
              case 'Community':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case 'Practice':
                iconName = focused ? 'create' : 'create-outline';
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: THEME_COLOR,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 5,
          },
          tabBarLabelStyle: { fontSize: 10 },
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen name="Learn" component={LearnScreen} />
        <Tab.Screen name="AI Mentor" component={AiMentorScreen} />
        <Tab.Screen name="Streams" component={CertificationScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Practice" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

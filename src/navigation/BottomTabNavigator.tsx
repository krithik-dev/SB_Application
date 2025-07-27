// src/navigation/BottomTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LearnScreen from '../screens/LearnScreen';
import AiMentorScreen from '../screens/AiMentorScreen';
import CertificationScreen from '../screens/CertificationScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="AI Mentor" component={AiMentorScreen} />
      <Tab.Screen name="Certification" component={CertificationScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

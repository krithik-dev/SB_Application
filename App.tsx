// App.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import QuizScreen from './src/screens/QuizScreen';
import CoachingChatScreen from './src/screens/CoachingChatScreen';


// Community feature screens
import PeerCoachingChat from './src/screens/PeerCoachingChat';
import GlobalClassroomChat from './src/screens/GlobalClassroomChat';
import EducationalDAO from './src/screens/EducationalDAO';
import InternshipMarketplace from './src/screens/InternshipMarketplace';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ headerShown: true, title: 'Lesson Quiz' }}
            />
            <Stack.Screen
              name="CoachingChat"
              component={CoachingChatScreen}
              options={{ headerShown: true, title: 'Coaching Chat' }}
            />

            {/* ✅ Community Feature Screens */}
            <Stack.Screen
              name="PeerCoachingChat"
              component={PeerCoachingChat}
              options={{ headerShown: false, title: 'Peer Coaching' }}
            />
            <Stack.Screen
              name="GlobalClassroomChat"
              component={GlobalClassroomChat}
              options={{ headerShown: true, title: 'Global Classroom' }}
            />
            <Stack.Screen
              name="EducationalDAO"
              component={EducationalDAO}
              options={{ headerShown: false, title: 'Educational DAO' }}
            />
            <Stack.Screen
              name="InternshipMarketplace"
              component={InternshipMarketplace}
              options={{ headerShown: true, title: 'Micro Internships' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

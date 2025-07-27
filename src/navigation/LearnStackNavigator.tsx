import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LearnScreen from '../screens/LearnScreen';
import CourseScreen from '../screens/CourseScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import QuizScreen from '../screens/QuizScreen';

export type LearnStackParamList = {
  Learn: undefined;
  Course: { courseId: string };
  LessonDetail: { lessonId: string };
  Quiz: { lessonId: string };
};

const Stack = createNativeStackNavigator<LearnStackParamList>();

export default function LearnStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Learn" component={LearnScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
}

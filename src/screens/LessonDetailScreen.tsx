// src/screens/LessonDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type LessonDetailParams = {
  LessonDetail: {
    lessonId: string;
    lessonTitle: string;
    sectionId: string;
  };
};

type Props = RouteProp<LessonDetailParams, 'LessonDetail'>;

export default function LessonDetailScreen() {
  const route = useRoute<Props>();
  const navigation = useNavigation();

  const { lessonId, lessonTitle, sectionId } = route.params;

  const handleQuiz = () => {
    Alert.alert('Quiz Feature', 'This will launch the AI quiz for this lesson (soon!)');
  };

  const handleComplete = () => {
    Alert.alert('Completed!', 'You completed this lesson. We’ll update the progress (soon)');
    navigation.goBack(); // or update locally if needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{lessonTitle}</Text>
      <Text style={styles.subText}>Lesson ID: {lessonId}</Text>

      {/* Placeholder for actual lesson content */}
      <Text style={styles.content}>
        [Lesson content goes here – video, text, resources etc.]
      </Text>

      <Button title="Take Quiz" onPress={handleQuiz} />
      <View style={{ marginVertical: 8 }} />
      <Button title="Mark as Complete" onPress={handleComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subText: {
    color: '#777',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
  },
});

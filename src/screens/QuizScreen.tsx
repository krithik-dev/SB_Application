// src/screens/QuizScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { quizData } from '../data/quizData';
import { supabase } from '../lib/supabase';
import { markLessonCompleted } from '../lib/lessonProgress';
import { updateUserStats } from '../lib/userStats';

export default function QuizScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { lessonId } = route.params;

  const questions = quizData[lessonId] || [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = questions[current];

  const handleAnswer = async (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    if (option === question.answer) {
      if (current < questions.length - 1) {
        setTimeout(() => {
          setCurrent(current + 1);
          setSelected(null);
          setAnswered(false);
        }, 1000);
      } else {
        await handleQuizPassed();
      }
    } else {
      Alert.alert('Incorrect', 'Try again!');
      setAnswered(false);
      setSelected(null);
    }
  };

  const handleQuizPassed = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (!userId) return Alert.alert('Error', 'User not logged in.');

    try {
      await markLessonCompleted(userId, lessonId);
      await updateUserStats(userId, { xp: 10, energy: -5, streakIncrement: true });
      Alert.alert('Success', 'Quiz completed!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not update progress.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {question ? (
        <>
          <Text style={styles.question}>{question.question}</Text>
          {question.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleAnswer(opt)}
              style={[
                styles.option,
                selected === opt && {
                  backgroundColor: opt === question.answer ? '#7fe8a3' : '#f88',
                },
              ]}
            >
              <Text>{opt}</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <Text style={styles.question}>No questions found for this lesson.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  question: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  option: {
    padding: 15,
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 8,
  },
});

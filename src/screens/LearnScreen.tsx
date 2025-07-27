// LearnScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { pythonCourse } from '../data/pythonCourse';
import { getUserLessonProgress } from '../lib/lessonProgress';
import { getUserStats } from '../lib/userStats';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { FontAwesome5 } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;

const LearnScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [courseData, setCourseData] = useState(pythonCourse);
  const [loading, setLoading] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);

  const [xp, setXp] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [streak, setStreak] = useState(0);

  const fetchProgress = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;
    if (!userId) return;

    const stats = await getUserStats(userId);
    setXp(stats.xp || 0);
    setEnergy(stats.energy || 100);
    setStreak(stats.streak || 0);

    const progress = await getUserLessonProgress(userId);
    const completedLessonIds = new Set(progress.map((p) => p.lesson_id));

    let totalLessons = 0;
    let completedCount = 0;

    const updatedSections = pythonCourse.map((section) => {
      let unlocked = true;
      const updatedLessons = section.lessons.map((lesson) => {
        const isCompleted = completedLessonIds.has(lesson.id);
        const lessonData = {
          ...lesson,
          isCompleted,
          isLocked: !unlocked,
        };

        totalLessons += 1;
        if (isCompleted) {
          completedCount += 1;
          unlocked = true;
        } else {
          unlocked = false;
        }

        return lessonData;
      });

      const sectionCompleted = updatedLessons.filter((l) => l.isCompleted).length;
      const sectionProgress = Math.floor((sectionCompleted / updatedLessons.length) * 100);

      return {
        ...section,
        lessons: updatedLessons,
        progress: sectionProgress,
      };
    });

    setCourseData(updatedSections);
    setProgressPercent(Math.floor((completedCount / totalLessons) * 100));
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🎯 Top Gamification Bar */}
      <View style={styles.topBar}>
        <View style={styles.gamifyPill}>
          <View style={styles.gamifyItem}>
            <FontAwesome5 name="coins" size={16} color="#8a2be2" />
            <Text style={styles.gamifyText}>{xp}</Text>
          </View>
        </View>
        <View style={styles.gamifyPill}>
          <View style={styles.gamifyItem}>
            <FontAwesome5 name="chart-line" size={16} color="#8a2be2" />
            <Text style={styles.gamifyText}>{progressPercent}%</Text>
          </View>
        </View>
        <View style={styles.gamifyPill}>
          <View style={styles.gamifyItem}>
            <FontAwesome5 name="bolt" size={16} color="#8a2be2" />
            <Text style={styles.gamifyText}>{energy}</Text>
          </View>
        </View>
      </View>

      {/* 💜 Course Card */}
      <View style={styles.courseCard}>
        <Text style={styles.courseTitle}>Python Development - course</Text>
        <ProgressBar progress={progressPercent / 100} color="#a472f2" style={styles.progressBar} />
        <Text style={styles.courseSubtitle}>My learnings</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>Python development</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>+</Text></View>
        </View>
      </View>

      {/* 🧩 Sections and Lessons */}
      {courseData.map((section) => (
        <View key={section.id} style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          <View style={styles.lessonList}>
            {section.lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                disabled={lesson.isLocked}
                onPress={() => navigation.navigate('Quiz', { lessonId: lesson.id })}
                style={[
                  styles.lessonCard,
                  lesson.isCompleted && styles.lessonCompleted,
                  lesson.isLocked && styles.lessonLocked,
                ]}
              >
                <Text style={styles.lessonText}>
                  {lesson.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fce5ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  gamifyPill: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e3c4ff',
  },
  gamifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gamifyText: {
    fontWeight: 'bold',
    color: '#8a2be2',
    marginLeft: 6,
  },
  courseCard: {
    backgroundColor: '#e3c4ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3d0066',
  },
  courseSubtitle: {
    marginTop: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6a00aa',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0dfff',
  },
  sectionWrapper: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  lessonList: {
    gap: 10,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#dcdcdc',
    elevation: 2,
  },
  lessonCompleted: {
    borderColor: '#b27bff',
    backgroundColor: '#f4edff',
  },
  lessonLocked: {
    opacity: 0.5,
  },
  lessonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LearnScreen;

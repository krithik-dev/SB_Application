import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';


export default function CourseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Course Placeholder</Text>
      <Text style={styles.subtitle}>This screen will list all the sections and lessons in the course.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f5ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6c2bd9',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
});

// src/screens/InternshipMarketplace.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const InternshipMarketplace = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>💼 Micro Internship Marketplace</Text>
        <Text style={styles.text}>Find real-world mini-projects to earn experience & XP.</Text>

        <Text style={styles.text}>🔧 Project: Build a landing page for a school NGO</Text>
        <Text style={styles.text}>🕒 Duration: 3 days | 💰 XP: 500</Text>

        <Text style={styles.text}>🖥️ Project: Translate Python course to Tamil</Text>
        <Text style={styles.text}>🕒 Duration: 5 days | 💰 XP: 800</Text>

        <Text style={styles.textFaded}>
          Internships will soon be linked to your learning progress.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InternshipMarketplace;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faff',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#00688b',
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  textFaded: {
    fontSize: 14,
    marginTop: 20,
    color: '#888',
  },
});

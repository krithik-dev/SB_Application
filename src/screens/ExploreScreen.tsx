// src/screens/ExploreScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Explore</Text>
      <Text style={styles.subtitle}>This screen will display curated YouTube videos and free internet resources for each course topic.</Text>
    </View>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});

// src/screens/CareerScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


const CareerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💼 Career</Text>
      <Text style={styles.subtitle}>This will host micro-internships, DAO collaboration, project streaming, certifications, and more.</Text>
    </View>
  );
};

export default CareerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
});

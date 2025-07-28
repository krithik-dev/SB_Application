// src/screens/PeerCoachingChat.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const PeerCoachingChat = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>🤝 Anonymous Peer Coaching</Text>
        <Text style={styles.text}>
          Chat anonymously with another learner. Share doubts, explain concepts, and learn together.
        </Text>

        <Text style={styles.chatSample}>👤 You: I don’t get how Python loops work.</Text>
        <Text style={styles.chatSample}>👥 Peer: Try thinking of them like a song repeating!</Text>
        <Text style={styles.chatSample}>👤 You: Ohh makes sense. Thanks a lot!</Text>

        <Text style={styles.textFaded}>
          You'll be randomly paired with another learner for real-time coaching.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PeerCoachingChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#5a189a',
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  chatSample: {
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d1c4e9',
  },
  textFaded: {
    fontSize: 14,
    marginTop: 20,
    color: '#888',
  },
});

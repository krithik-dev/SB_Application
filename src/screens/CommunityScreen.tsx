import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PURPLE = '#6C63FF';

const CommunityScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Community</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PeerCoachingChat')}
      >
        <Ionicons name="chatbubbles-outline" size={24} color={PURPLE} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Anonymous Peer Coaching</Text>
          <Text style={styles.cardDesc}>
            Chat anonymously with other learners and exchange knowledge freely.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GlobalClassroomChat')}
      >
        <Ionicons name="people-outline" size={24} color={PURPLE} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Global Classroom Pairing</Text>
          <Text style={styles.cardDesc}>
            Get paired with students from other countries for real-time collaboration.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('EducationalDAO')}
      >
        <MaterialCommunityIcons name="vote-outline" size={24} color={PURPLE} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Educational DAO Voting</Text>
          <Text style={styles.cardDesc}>
            Vote on educational improvements and community decisions democratically.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InternshipMarketplace')}
      >
        <MaterialCommunityIcons name="briefcase-outline" size={24} color={PURPLE} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Micro-Internship Marketplace</Text>
          <Text style={styles.cardDesc}>
            Discover bite-sized remote internship opportunities in your field.
          </Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PURPLE,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f3f1ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderColor: PURPLE,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
  },
});

export default CommunityScreen;

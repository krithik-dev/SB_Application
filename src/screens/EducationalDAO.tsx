// src/screens/EducationalDAO.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

type Proposal = {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  vote_count?: number;
};

export default function EducationalDAO() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [votedProposalIds, setVotedProposalIds] = useState<string[]>([]);

  const fetchProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dao_proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setProposals([
        {
          id: 'sample-1',
          title: 'Add AI-Powered Mentorship',
          description: 'Propose integrating AI mentors into coding tracks.',
          created_by: 'DemoUser1',
          created_at: new Date().toISOString(),
          vote_count: 3,
        },
        {
          id: 'sample-2',
          title: 'Create Offline Course Access',
          description: 'Support rural students with offline-first downloads.',
          created_by: 'DemoUser2',
          created_at: new Date().toISOString(),
          vote_count: 5,
        },
        {
          id: 'sample-3',
          title: 'Blockchain Certificates for All',
          description: 'Add verifiable course completion certificates.',
          created_by: 'DemoUser3',
          created_at: new Date().toISOString(),
          vote_count: 4,
        },
        {
          id: 'sample-4',
          title: 'Live Peer Learning Streams',
          description: 'Introduce Twitch-style streaming for collaboration.',
          created_by: 'DemoUser4',
          created_at: new Date().toISOString(),
          vote_count: 6,
        },
        {
          id: 'sample-5',
          title: 'SMS-Based Tutoring for Villages',
          description: 'Allow access to content through basic SMS phones.',
          created_by: 'DemoUser5',
          created_at: new Date().toISOString(),
          vote_count: 2,
        },
        {
          id: 'sample-6',
          title: 'Micro Internship Marketplace',
          description: 'Earn skill XP and micro-credentials through work.',
          created_by: 'DemoUser6',
          created_at: new Date().toISOString(),
          vote_count: 3,
        },
      ]);
    } else {
      const { data: votes } = await supabase.from('dao_votes').select('proposal_id, user_id');
      const user = (await supabase.auth.getUser()).data.user;

      const voteCounts: Record<string, number> = {};
      const votedIds: string[] = [];

      votes?.forEach((vote) => {
        voteCounts[vote.proposal_id] = (voteCounts[vote.proposal_id] || 0) + 1;
        if (vote.user_id === user?.id) votedIds.push(vote.proposal_id);
      });

      const enriched = data.map((p) => ({
        ...p,
        vote_count: voteCounts[p.id] || 0,
      }));

      setProposals(enriched);
      setVotedProposalIds(votedIds);
    }
    setLoading(false);
  };

  const handleSubmitProposal = async () => {
    if (!newTitle || !newDescription) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return Alert.alert('Error', 'Not logged in');

    const { error } = await supabase.from('dao_proposals').insert([
      {
        title: newTitle,
        description: newDescription,
        created_by: user.email,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Submission error:', error);
      Alert.alert('Error submitting proposal', error.message);
    } else {
      setNewTitle('');
      setNewDescription('');
      fetchProposals();
    }
  };

  const handleVote = async (proposalId: string) => {
    if (votedProposalIds.includes(proposalId)) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return Alert.alert('Error', 'Not logged in');

    const { error } = await supabase.from('dao_votes').insert([
      {
        proposal_id: proposalId,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error('Vote error:', error);
      Alert.alert('Error voting', error.message);
    } else {
      setVotedProposalIds((prev) => [...prev, proposalId]);
      fetchProposals();
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const renderItem = ({ item }: { item: Proposal }) => {
    const voted = votedProposalIds.includes(item.id);

    return (
      <View style={styles.proposalCard}>
        <Text style={styles.proposalTitle}>{item.title}</Text>
        <Text style={styles.proposalMeta}>By {item.created_by}</Text>
        <Text style={styles.proposalDescription}>{item.description}</Text>
        <View style={styles.voteRow}>
          <TouchableOpacity
            onPress={() => handleVote(item.id)}
            style={[
              styles.voteButton,
              voted && { backgroundColor: '#28a745' }, // Green when voted
            ]}
            disabled={voted}
          >
            <Ionicons name="thumbs-up-outline" size={20} color="white" />
            <Text style={styles.voteText}>{voted ? 'Voted' : 'Vote'}</Text>
          </TouchableOpacity>
          <Text style={styles.voteCount}>{item.vote_count} votes</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={proposals}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Educational DAO</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Proposal Title"
                placeholderTextColor="#ccc"
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.input}
              />
              <TextInput
                placeholder="Proposal Description"
                placeholderTextColor="#ccc"
                value={newDescription}
                onChangeText={setNewDescription}
                style={[styles.input, { height: 80 }]}
                multiline
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitProposal}>
                <Ionicons name="send" size={18} color="white" />
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subHeader}>Live Proposals</Text>
          </>
        }
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b2e',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f2f2f2',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f2f2f2',
    marginVertical: 16,
  },
  inputContainer: {
    backgroundColor: '#2e294e',
    borderRadius: 12,
    padding: 12,
  },
  input: {
    backgroundColor: '#413a66',
    color: 'white',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#7a5fff',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  proposalCard: {
    backgroundColor: '#2e294e',
    borderRadius: 10,
    padding: 14,
    marginVertical: 8,
  },
  proposalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  proposalMeta: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  proposalDescription: {
    color: '#ddd',
    marginTop: 8,
    fontSize: 14,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7a5fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  voteText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  voteCount: {
    color: '#aaa',
    fontSize: 14,
  },
});

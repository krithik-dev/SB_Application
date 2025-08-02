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
  SafeAreaView,
  Animated,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

type Proposal = {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
};

export default function EducationalDAO() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [voteAnim] = useState(new Animated.Value(1));

  // ✅ Fetch proposals and votes
  const fetchProposals = async () => {
    setLoading(true);

    const { data: proposalData, error } = await supabase
      .from('dao_proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch proposals');
      setLoading(false);
      return;
    }

    const { data: votesData } = await supabase
      .from('dao_votes')
      .select('proposal_id, user_id, vote_type');

    const user = (await supabase.auth.getUser()).data.user;

    const voteCounts: Record<string, { up: number; down: number }> = {};
    const userVoteMap: Record<string, string> = {};

    votesData?.forEach((vote) => {
      if (!voteCounts[vote.proposal_id]) voteCounts[vote.proposal_id] = { up: 0, down: 0 };
      if (vote.vote_type === 'upvote') voteCounts[vote.proposal_id].up += 1;
      else voteCounts[vote.proposal_id].down += 1;

      if (vote.user_id === user?.id) userVoteMap[vote.proposal_id] = vote.vote_type;
    });

    const enriched = proposalData.map((p) => ({
      ...p,
      upvotes: voteCounts[p.id]?.up || 0,
      downvotes: voteCounts[p.id]?.down || 0,
    }));

    setProposals(enriched);
    setUserVotes(userVoteMap);
    setLoading(false);
  };

  // ✅ Submit a new learning topic proposal
  const handleSubmitProposal = async () => {
    if (!newTitle || !newDescription) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return Alert.alert('Error', 'Not logged in');

    const { error } = await supabase.from('dao_proposals').insert([
      { title: newTitle, description: newDescription, created_by: user.email },
    ]);

    if (error) Alert.alert('Error', error.message);
    else {
      setNewTitle('');
      setNewDescription('');
      fetchProposals();
    }
  };

  // ✅ Handle votes (upvote/downvote toggle)
  const handleVote = async (proposalId: string, type: 'upvote' | 'downvote') => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return Alert.alert('Error', 'Not logged in');

    const existingVote = userVotes[proposalId];
    if (existingVote === type) return;

    // Remove old vote if exists
    if (existingVote) {
      await supabase.from('dao_votes').delete().match({ proposal_id: proposalId, user_id: user.id });
    }

    // Insert new vote
    const { error } = await supabase
      .from('dao_votes')
      .insert([{ proposal_id: proposalId, user_id: user.id, vote_type: type }]);

    if (error) Alert.alert('Error', error.message);
    else {
      triggerVoteAnimation();
      fetchProposals();
    }
  };

  // ✅ Voting animation
  const triggerVoteAnimation = () => {
    Animated.sequence([
      Animated.timing(voteAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(voteAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // ✅ Find top-voted topic (highest net votes)
  const topProposal =
    proposals.length > 0
      ? proposals.reduce((max, p) =>
          p.upvotes! - p.downvotes! > max.upvotes! - max.downvotes! ? p : max
        )
      : null;

  // ✅ Render proposal cards
  const renderItem = ({ item }: { item: Proposal }) => {
    const userVote = userVotes[item.id];

    return (
      <View style={styles.proposalCard}>
        <Text style={styles.proposalTitle}>{item.title}</Text>
        <Text style={styles.proposalMeta}>Proposed by {item.created_by}</Text>
        <Text style={styles.proposalDescription}>{item.description}</Text>
        <View style={styles.voteRow}>
          <View style={styles.voteGroup}>
            <TouchableOpacity onPress={() => handleVote(item.id, 'upvote')}>
              <Animated.View
                style={[
                  styles.voteButton,
                  userVote === 'upvote' && { backgroundColor: '#28a745', transform: [{ scale: voteAnim }] },
                ]}
              >
                <Ionicons name="thumbs-up-outline" size={18} color="white" />
                <Text style={styles.voteText}>{item.upvotes}</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleVote(item.id, 'downvote')}>
              <Animated.View
                style={[
                  styles.voteButton,
                  userVote === 'downvote' && { backgroundColor: '#d9534f', transform: [{ scale: voteAnim }] },
                ]}
              >
                <Ionicons name="thumbs-down-outline" size={18} color="white" />
                <Text style={styles.voteText}>{item.downvotes}</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text style={styles.netVotes}>Net: {item.upvotes! - item.downvotes!}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={proposals}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <Text style={styles.pageTitle}>Educational DAO</Text>

              {topProposal && (
                <View style={styles.topPriorityCard}>
                  <Text style={styles.priorityLabel}>🎯 Top Priority Education</Text>
                  <Text style={styles.priorityTitle}>{topProposal.title}</Text>
                  <Text style={styles.priorityDesc}>{topProposal.description}</Text>
                  <Text style={styles.priorityVotes}>
                    {topProposal.upvotes} 👍 | {topProposal.downvotes} 👎 | Net: {topProposal.upvotes! - topProposal.downvotes!}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter Learning Topic"
                  placeholderTextColor="#ccc"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Why should this be taught?"
                  placeholderTextColor="#ccc"
                  value={newDescription}
                  onChangeText={setNewDescription}
                  style={[styles.input, { height: 80 }]}
                  multiline
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitProposal}>
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.submitText}>Submit Topic</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subHeader}>📚 Vote: What should be taught next?</Text>
            </>
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginVertical: 16, textAlign: 'center' },
  topPriorityCard: { backgroundColor: '#1f1b3a', padding: 16, borderRadius: 12, marginBottom: 20 },
  priorityLabel: { fontSize: 14, color: '#bbb' },
  priorityTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginVertical: 4 },
  priorityDesc: { color: '#ddd', marginBottom: 6 },
  priorityVotes: { color: '#7a5fff', fontWeight: '600' },
  inputContainer: { backgroundColor: '#1f1b3a', borderRadius: 12, padding: 12, marginBottom: 20 },
  input: { backgroundColor: '#2a2550', color: 'white', borderRadius: 8, padding: 10, marginVertical: 6 },
  submitButton: { flexDirection: 'row', backgroundColor: '#7a5fff', borderRadius: 8, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitText: { color: 'white', fontWeight: '600', marginLeft: 8 },
  subHeader: { fontSize: 18, fontWeight: '600', color: '#f2f2f2', marginVertical: 16 },
  proposalCard: { backgroundColor: '#1f1b3a', borderRadius: 10, padding: 14, marginVertical: 8 },
  proposalTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  proposalMeta: { color: '#aaa', fontSize: 12, marginTop: 2 },
  proposalDescription: { color: '#ddd', marginTop: 8, fontSize: 14 },
  voteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
  voteGroup: { flexDirection: 'row', gap: 8 },
  voteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7a5fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  voteText: { color: 'white', fontWeight: '600', marginLeft: 4 },
  netVotes: { color: '#aaa', fontSize: 14 },
});

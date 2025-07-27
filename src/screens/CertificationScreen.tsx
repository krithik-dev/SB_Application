import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchComments, addComment } from '../lib/commentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import stream1Image from '../../assets/images/stream1.png';
import stream2Image from '../../assets/images/stream2.png';

const PURPLE = '#6C63FF';

const mockStreams = [
  {
    id: '0e8a4c4b-2c3f-43c2-a4ef-59c40b3ec3ad',
    title: 'Building a Python ToDo App',
    user: 'CodeWithAnya',
    avatar: 'https://i.pravatar.cc/100?img=1',
    viewers: 58,
    thumbnail: stream1Image,
    initialComments: [
      'Welcome to the stream!',
      'Loving this app idea.',
      'Great explanation!',
      'What library are you using?',
      'Can you share the repo link?',
      'Awesome stream!',
    ],
  },
  {
    id: '9c258930-d1fa-4a84-84b4-80d47e2757b3',
    title: 'ML Mini Project: Digit Classifier',
    user: 'DevStudent42',
    avatar: 'https://i.pravatar.cc/100?img=2',
    viewers: 32,
    thumbnail: stream2Image,
    initialComments: [
      'Hey all!',
      'This is super helpful.',
      'I love ML!',
      'Can you explain sigmoid?',
      'How to deploy this?',
      '🔥🔥🔥',
    ],
  },
  {
    id: 'd44ac231-2f6e-4e9f-b5ef-1234567890ab',
    title: 'ML Mini Project: Digit Classifier',
    user: 'DevStudent42',
    avatar: 'https://i.pravatar.cc/100?img=2',
    viewers: 32,
    thumbnail: stream2Image,
    initialComments: [
      'Hey all!',
      'This is super helpful.',
      'I love ML!',
      'Can you explain sigmoid?',
      'How to deploy this?',
      '🔥🔥🔥',
    ],
  },
  {
    id: 'e77ec8d0-1f95-4ab9-bb22-abcdefabcdef',
    title: 'Building a Python ToDo App',
    user: 'CodeWithAnya',
    avatar: 'https://i.pravatar.cc/100?img=1',
    viewers: 58,
    thumbnail: stream1Image,
    initialComments: [
      'Welcome again!',
      'Still love this app idea.',
      'Redux or Zustand?',
      'What backend are you using?',
      'Firebase or Supabase?',
      '🔥🔥🔥',
    ],
  },
];

type Stream = typeof mockStreams[0];

type Comment = {
  id: string;
  user: string;
  avatar: string;
  message: string;
  created_at?: string;
};

const CertificationScreen = () => {
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadComments = async (streamId: string) => {
    try {
      const data = await fetchComments(streamId);
      if (data.length > 0) {
        setComments(data);
      } else {
        const stream = mockStreams.find((s) => s.id === streamId);
        const sample = stream?.initialComments.map((msg, idx) => ({
          id: `sample-${idx}`,
          user: stream.user,
          avatar: stream.avatar,
          message: msg,
        })) ?? [];
        setComments(sample);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedStream) return;
    const newEntry: Comment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://i.pravatar.cc/100?img=5',
      message: newComment.trim(),
    };
    setComments((prev) => [newEntry, ...prev]);
    setNewComment('');
    try {
      await addComment(selectedStream.id, newEntry.user, newEntry.avatar, newEntry.message);
    } catch (err) {
      console.error('Failed to save comment:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadLastStream = async () => {
        const stored = await AsyncStorage.getItem('selectedStream');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedStream(parsed);
          loadComments(parsed.id);
        }
      };
      loadLastStream();
    }, [])
  );

  const selectStream = async (stream: Stream) => {
    await AsyncStorage.setItem('selectedStream', JSON.stringify(stream));
    setSelectedStream(stream);
    loadComments(stream.id);
  };

  if (selectedStream) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={styles.flex}>
          <View style={styles.viewerContainer}>
            <TouchableOpacity onPress={() => setSelectedStream(null)}>
              <Text style={styles.backButton}>
                <Ionicons name="arrow-back" size={18} /> Back
              </Text>
            </TouchableOpacity>

            <View style={styles.videoContainer}>
              <Image
                source={selectedStream.thumbnail}
                style={{ width: '100%', height: '100%', borderRadius: 16 }}
              />
            </View>

            <Text style={styles.title}>{selectedStream.title}</Text>
            <Text style={styles.subtitle}>
              <Ionicons name="person-circle" size={14} /> {selectedStream.user} ·{' '}
              <Ionicons name="eye" size={14} /> {selectedStream.viewers} watching
            </Text>

            <View style={styles.chatHeader}>
              <MaterialCommunityIcons name="chat-outline" size={20} color={PURPLE} />
              <Text style={styles.chatTitle}>Live Chat</Text>
            </View>

            {comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <Text style={styles.commentText}>{item.message}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleAddComment}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {mockStreams.map((stream) => (
        <TouchableOpacity
          key={stream.id}
          onPress={() => selectStream(stream)}
          style={styles.card}
        >
          <Image source={stream.thumbnail} style={styles.thumbnail} />
          <View style={styles.cardInfo}>
            <Image source={{ uri: stream.avatar }} style={styles.avatarSmall} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cardTitle}>{stream.title}</Text>
              <Text style={styles.cardUser}>{stream.user}</Text>
              <Text style={styles.cardViewers}>{stream.viewers} watching</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, backgroundColor: '#fff', paddingBottom: 40 },
  card: {
    backgroundColor: '#f4f3ff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: PURPLE,
    borderWidth: 1,
  },
  thumbnail: { width: '100%', height: 180 },
  cardInfo: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardUser: { fontSize: 14, color: '#555', marginTop: 2 },
  cardViewers: { fontSize: 12, color: '#888', marginTop: 2 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18 },
  viewerContainer: { flex: 1, padding: 16 },
  backButton: { color: PURPLE, marginBottom: 12, fontSize: 16 },
  videoContainer: {
    height: 200,
    backgroundColor: PURPLE,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#111' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 12 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  chatTitle: { fontSize: 16, fontWeight: 'bold', color: PURPLE },
  commentItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  commentUser: { fontWeight: 'bold', color: PURPLE },
  commentText: { color: '#333' },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
});

export default CertificationScreen;

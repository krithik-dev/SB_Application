import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const PURPLE = '#6C63FF';

type PeerProfile = {
  id: string;
  name: string;
  learning_field: string;
  avatar_url: string;
};

type Message = {
  id: string;
  sender: 'you' | 'peer';
  text: string;
  avatar?: string;
  name?: string;
};

const PeerCoachingChat = () => {
  const [searchTopic, setSearchTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [peerName, setPeerName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [peers, setPeers] = useState<PeerProfile[]>([]);

  // ✅ Fetch peers from Supabase
  useEffect(() => {
    const fetchPeers = async () => {
      const { data, error } = await supabase.from('peer_profiles').select('*');
      if (error) console.error(error);
      else setPeers(data);
    };
    fetchPeers();
  }, []);

  const findPeer = () => {
    if (!searchTopic.trim()) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (searchTopic.trim().toLowerCase() === 'python') {
        setMatchFound(true);
        setAiMode(true);
        setPeerName('Alex (AI Peer)');
        setMessages([
          {
            id: '1',
            sender: 'peer',
            text: `Hey! I'm Alex, your AI peer for Python. Let's discuss Python basics.`,
            avatar: 'https://i.pravatar.cc/100?img=12',
            name: 'Alex (AI Peer)',
          },
        ]);
      } else {
        // If topic doesn't match AI demo, show normal chat
        setMatchFound(true);
        setAiMode(false);
        const selected = peers[Math.floor(Math.random() * peers.length)];
        setPeerName(selected.name);
        setMessages([
          {
            id: '1',
            sender: 'peer',
            text: `Hey! I'm ${selected.name}. Excited to chat about ${searchTopic}!`,
            avatar: selected.avatar_url,
            name: selected.name,
          },
        ]);
      }
    }, 2000);
  };

  const joinPeer = (peer: PeerProfile) => {
    setPeerName(peer.name);
    setMessages([
      {
        id: '1',
        sender: 'peer',
        text: `Hey! I'm ${peer.name}, let's discuss ${peer.learning_field}!`,
        avatar: peer.avatar_url,
        name: peer.name,
      },
    ]);
    setMatchFound(true);
    setAiMode(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'you',
      text: newMessage.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    if (aiMode) {
      setTimeout(() => {
        const aiReply: Message = {
          id: Date.now().toString() + '-ai',
          sender: 'peer',
          text: `Interesting! Here's what I think about "${userMessage.text}" in Python.`,
          avatar: 'https://i.pravatar.cc/100?img=12',
          name: 'Alex (AI Peer)',
        };
        setMessages((prev) => [...prev, aiReply]);
      }, 800);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'you' ? styles.yourMessage : styles.peerMessage,
      ]}
    >
      {item.sender === 'peer' && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
      <View style={styles.messageBubble}>
        {item.sender === 'peer' && <Text style={styles.peerName}>{item.name}</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  // 🔄 Loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Finding the best peer for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 🏁 Initial search screen (Peers + Search)
  if (!matchFound) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <FontAwesome5 name="user-friends" size={50} color={PURPLE} style={{ marginBottom: 20 }} />
          <Text style={styles.heading}>Find a Peer to Chat</Text>
          <Text style={styles.subheading}>Search a topic or join an available peer</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={PURPLE} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter a topic (e.g. Python)"
              value={searchTopic}
              onChangeText={setSearchTopic}
            />
          </View>
          <TouchableOpacity style={styles.matchButton} onPress={findPeer}>
            <MaterialCommunityIcons name="account-search" size={20} color="#fff" />
            <Text style={styles.matchButtonText}>Find Peer</Text>
          </TouchableOpacity>

          {/* Available Peers */}
          <Text style={styles.peerListHeading}>Available Peers:</Text>
          <FlatList
            data={peers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.peerCard}>
                <Image source={{ uri: item.avatar_url }} style={styles.peerAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.peerNameCard}>{item.name}</Text>
                  <Text style={styles.peerField}>{item.learning_field}</Text>
                </View>
                <TouchableOpacity style={styles.joinButton} onPress={() => joinPeer(item)}>
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  // 💬 Chat UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContainer}
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setMatchFound(false)}>
              <Ionicons name="arrow-back" size={26} color={PURPLE} style={{ marginRight: 8 }} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#555' },
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', color: PURPLE, marginBottom: 8, textAlign: 'center' },
  subheading: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PURPLE,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchInput: { flex: 1, padding: 10 },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  matchButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  peerListHeading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: PURPLE },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f3ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  peerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  peerNameCard: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  peerField: { fontSize: 14, color: '#555' },
  joinButton: {
    backgroundColor: PURPLE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  joinButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  chatContainer: { padding: 16 },
  messageContainer: { flexDirection: 'row', marginBottom: 10 },
  yourMessage: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
  peerMessage: { justifyContent: 'flex-start', alignSelf: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  messageBubble: { backgroundColor: '#f4f3ff', padding: 10, borderRadius: 12, maxWidth: '75%' },
  peerName: { fontSize: 12, color: PURPLE, fontWeight: 'bold', marginBottom: 2 },
  messageText: { fontSize: 14, color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: { marginLeft: 8, backgroundColor: PURPLE, padding: 10, borderRadius: 20 },
});

export default PeerCoachingChat;

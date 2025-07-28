import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface Classroom {
  id: string;
  name: string;
  description: string;
  isSample?: boolean;
}

interface Message {
  id: string;
  classroom_id: string;
  sender: string;
  content: string;
  created_at: string;
}

const sampleClassrooms: Classroom[] = [
  {
    id: 'sample-1',
    name: 'Intro to Python - India',
    description: 'Sourced from Rural Schools Project 🇮🇳',
    isSample: true,
  },
  {
    id: 'sample-2',
    name: 'Data Science Bootcamp - Kenya',
    description: 'UNDP Youth Skill Initiative 🇰🇪',
    isSample: true,
  },
  {
    id: 'sample-3',
    name: 'Web Dev Basics - Philippines',
    description: 'Bayanihan Tech Corps 🇵🇭',
    isSample: true,
  },
  {
    id: 'sample-4',
    name: 'Robotics Club - Ghana',
    description: 'STEM Africa Fellowship 🇬🇭',
    isSample: true,
  },
  {
    id: 'sample-5',
    name: 'AI for All - Brazil',
    description: 'Open Tech Brasil 🇧🇷',
    isSample: true,
  },
  {
    id: 'sample-6',
    name: 'Mathematics Circle - Egypt',
    description: 'Cairo Learning Circle 🇪🇬',
    isSample: true,
  },
  {
    id: 'sample-7',
    name: 'Green Tech & Coding - Nepal',
    description: 'Himalayan Youth Fund 🇳🇵',
    isSample: true,
  },
  {
    id: 'sample-8',
    name: 'Cybersecurity 101 - Nigeria',
    description: 'Naija Dev Network 🇳🇬',
    isSample: true,
  },
  {
    id: 'sample-9',
    name: 'Blockchain for Students - Argentina',
    description: 'Buenos Aires Hack Club 🇦🇷',
    isSample: true,
  },
  {
    id: 'sample-10',
    name: 'Full Stack Dev - Indonesia',
    description: 'Tech4Change Jakarta 🇮🇩',
    isSample: true,
  },
];

const sampleMessages: Message[] = [
  {
    id: '1',
    classroom_id: 'sample-1',
    sender: 'Amina',
    content: 'Excited to start this journey!',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    classroom_id: 'sample-1',
    sender: 'Rahul',
    content: 'Let’s go everyone 🚀',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    classroom_id: 'sample-1',
    sender: 'Fatima',
    content: 'Any resources to revise Python loops?',
    created_at: new Date().toISOString(),
  },
];

export default function GlobalClassroomChat() {
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([]);
  const [joinedClassroom, setJoinedClassroom] = useState<Classroom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    const { data, error } = await supabase.from('classroom_pairs').select('*');
    if (error) {
      console.warn('Failed to fetch real classrooms, showing only samples.');
      setAvailableClassrooms(sampleClassrooms);
    } else {
      const all = [...sampleClassrooms, ...data];
      setAvailableClassrooms(all);
    }
  };

  const joinClassroom = async (classroom: Classroom) => {
    setJoinedClassroom(classroom);
    if (classroom.isSample) {
      setMessages(sampleMessages);
      return;
    }

    const { data: existing, error } = await supabase
      .from('classroom_members')
      .select('*')
      .eq('classroom_id', classroom.id)
      .single();

    if (!existing) {
      await supabase.from('classroom_members').insert({
        classroom_id: classroom.id,
      });
    }

    const { data: realMessages } = await supabase
      .from('classroom_messages')
      .select('*')
      .eq('classroom_id', classroom.id)
      .order('created_at', { ascending: true });

    if (realMessages) setMessages(realMessages);

    supabase
      .channel('classroom-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'classroom_messages',
          filter: `classroom_id=eq.${classroom.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !joinedClassroom) return;

    const msg = {
      classroom_id: joinedClassroom.id,
      content: newMessage,
      sender: 'You',
      created_at: new Date().toISOString(),
    };

    if (joinedClassroom.isSample) {
      setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() }]);
      setNewMessage('');
    } else {
      const { error } = await supabase.from('classroom_messages').insert(msg);
      if (!error) setNewMessage('');
    }
  };

  const renderClassroom = ({ item }: { item: Classroom }) => (
    <TouchableOpacity
      onPress={() => joinClassroom(item)}
      style={styles.classCard}
    >
      <Text style={styles.classTitle}>{item.name}</Text>
      <Text style={styles.classDesc}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={90}
    >
      {joinedClassroom ? (
        <View style={styles.chatContainer}>
          <Text style={styles.chatTitle}>{joinedClassroom.name}</Text>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.messageBubble}>
                <Text style={styles.messageSender}>{item.sender}:</Text>
                <Text style={styles.messageContent}>{item.content}</Text>
              </View>
            )}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            style={{ flex: 1 }}
          />
          <View style={styles.inputRow}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message"
              style={styles.input}
            />
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#5A31F4" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>🌍 Global Classrooms</Text>
          <FlatList
            data={availableClassrooms}
            renderItem={renderClassroom}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  classCard: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  classTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  classDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  chatContainer: { flex: 1, padding: 16 },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  messageBubble: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  messageSender: {
    fontWeight: 'bold',
    color: '#5A31F4',
  },
  messageContent: { color: '#333' },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
});

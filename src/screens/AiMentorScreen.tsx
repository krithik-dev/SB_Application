// AiMentorScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase'; // Ensure you have supabase set up for your project
import AnonymousCoachingScreen from '../src/screens/AnonymousCoachingScreen';


const genAI = new GoogleGenerativeAI("AIzaSyAmNHYvm1khcNJHUJZrLXzMv6NQOI_2Hoo");

interface Message {
  role: 'user' | 'model';
  content: string;
}

const AiMentorScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [projectIdea, setProjectIdea] = useState('');
  const [projectResponse, setProjectResponse] = useState('');
  const [loadingProject, setLoadingProject] = useState(false);

  const [gapModalVisible, setGapModalVisible] = useState(false);
  const [gapInput, setGapInput] = useState('');
  const [gapResponse, setGapResponse] = useState('');
  const [loadingGap, setLoadingGap] = useState(false);

  useEffect(() => {
    const startChat = async () => {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const newChat = model.startChat({
          history: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an experienced mentor helping students achieve quality education. 
Use a friendly tone and always guide with simple language and structured learning advice.`,
                },
              ],
            },
          ],
        });

        setChat(newChat);
      } catch (error) {
        console.error('Gemini error:', error);
      }
    };

    startChat();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    Keyboard.dismiss();

    try {
      const result = await chat.sendMessage(input.trim());
      const response = await result.response;
      const text = response.text();

      const botMessage: Message = { role: 'model', content: text };
      setMessages((prev) => [...prev, botMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Gemini error:', error);
    }
  };

  const handleGenerateCurriculum = async () => {
    if (!projectIdea.trim()) return;
    setLoadingProject(true);
    setProjectResponse('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(`Act as a senior project mentor.
Generate a project curriculum for the following idea:
"${projectIdea}".
Include learning goals, technologies needed, step-by-step plan, and suggested timeline.`);
      const response = await result.response;
      setProjectResponse(response.text());
    } catch (error) {
      setProjectResponse('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setLoadingProject(false);
    }
  };

  const handleGenerateGapPlan = async () => {
    if (!gapInput.trim()) return;
    setLoadingGap(true);
    setGapResponse('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `You're a curriculum mentor helping a student with weak areas.
Identify learning gaps and provide a step-by-step structured plan to improve in these topics: "${gapInput}".
Keep the language student-friendly.`
      );
      const response = await result.response;
      setGapResponse(response.text());
    } catch (error) {
      setGapResponse('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setLoadingGap(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* 💡 Feature Buttons */}
      <View style={styles.featuresGrid}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.cardText}>🧪 Project Curriculum Generator</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setGapModalVisible(true)}
        >
          <Text style={styles.cardText}>📊 Curriculum Gap Mapper</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('AnonymousCoaching')}
        >
          <Text style={styles.cardText}>🤝 Anonymous Coaching</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        ref={flatListRef}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your mentor..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* 🔍 Modal for Project Idea */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Describe Your Project Idea</Text>
          <TextInput
            value={projectIdea}
            onChangeText={setProjectIdea}
            placeholder="e.g. Weather tracking app"
            multiline
            style={styles.projectInput}
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleGenerateCurriculum}>
            <Text style={styles.modalButtonText}>Generate Curriculum</Text>
          </TouchableOpacity>
          <ScrollView style={styles.projectOutput}>
            <Text>{loadingProject ? 'Generating...' : projectResponse}</Text>
          </ScrollView>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
            <Text style={{ color: '#a472f2', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 📊 Modal for Gap Mapper */}
      <Modal visible={gapModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>What topics are you struggling with?</Text>
          <TextInput
            value={gapInput}
            onChangeText={setGapInput}
            placeholder="e.g. Loops, Data Structures"
            multiline
            style={styles.projectInput}
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleGenerateGapPlan}>
            <Text style={styles.modalButtonText}>Generate Learning Plan</Text>
          </TouchableOpacity>
          <ScrollView style={styles.projectOutput}>
            <Text>{loadingGap ? 'Analyzing gaps...' : gapResponse}</Text>
          </ScrollView>
          <TouchableOpacity onPress={() => setGapModalVisible(false)} style={styles.modalClose}>
            <Text style={{ color: '#a472f2', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AiMentorScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf8ff',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#dcb6ff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5d5ff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    width: '100%',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2eaff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#a472f2',
    borderRadius: 20,
    padding: 10,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  featureCard: {
    backgroundColor: '#ede3ff',
    padding: 14,
    borderRadius: 12,
    margin: 6,
    minWidth: '45%',
    alignItems: 'center',
  },
  cardText: {
    color: '#653ca4',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  projectInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  modalButton: {
    backgroundColor: '#a472f2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  projectOutput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f7ff',
  },
  modalClose: {
    marginTop: 12,
    alignItems: 'center',
  },
});

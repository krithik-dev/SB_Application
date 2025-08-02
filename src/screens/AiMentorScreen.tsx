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
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
Include learning goals, technologies needed, step-by-step plan, and suggested timeline.
Use bullet points, numbered lists, and **bold** keywords.`);
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
Identify learning gaps and provide a structured improvement plan with **bold titles**, numbered steps, and bullet points.
Topics: "${gapInput}"`
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

  /** ✅ Parse Markdown-like text (bold, bullets, numbers) */
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);

      // Determine line type: bullet, numbered, or normal
      const isNumbered = line.trim().match(/^\d+\./);
      const isBullet = line.trim().startsWith('*') || line.trim().startsWith('-');

      return (
        <Text key={index} style={[
          isNumbered ? styles.numberedText : isBullet ? styles.bulletText : styles.normalText
        ]}>
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <Text key={i} style={{ fontWeight: 'bold', color: '#4c2b85' }}>{part}</Text>
            ) : (
              part
            )
          )}
        </Text>
      );
    });
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
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Feature Cards */}
        <View style={styles.featuresGrid}>
          <TouchableOpacity style={styles.featureCard} onPress={() => setModalVisible(true)}>
            <Ionicons name="construct" size={28} color="#653ca4" style={styles.cardIcon} />
            <View>
              <Text style={styles.cardTitle}>Project Curriculum</Text>
              <Text style={styles.cardDesc}>Get a step-by-step project plan</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} onPress={() => setGapModalVisible(true)}>
            <Ionicons name="analytics" size={28} color="#653ca4" style={styles.cardIcon} />
            <View>
              <Text style={styles.cardTitle}>Curriculum Gap Mapper</Text>
              <Text style={styles.cardDesc}>Identify and fix weak topics</Text>
            </View>
          </TouchableOpacity>
          
        </View>

        {/* Chat Messages */}
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          ref={flatListRef}
        />

        {/* Chat Input */}
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

        {/* Project Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView style={styles.modalSafeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>💡 Describe Your Project Idea</Text>
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

                <ScrollView style={styles.responseOutput}>
                  {loadingProject ? <Text>Generating...</Text> : parseMarkdown(projectResponse)}
                </ScrollView>

                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                  <Text style={{ color: '#a472f2', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        {/* Gap Modal */}
        <Modal visible={gapModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalSafeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>📊 What topics are you struggling with?</Text>
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

                <ScrollView style={styles.responseOutput}>
                  {loadingGap ? <Text>Analyzing gaps...</Text> : parseMarkdown(gapResponse)}
                </ScrollView>

                <TouchableOpacity onPress={() => setGapModalVisible(false)} style={styles.modalClose}>
                  <Text style={{ color: '#a472f2', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default AiMentorScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf8ff' },
  chatContainer: { padding: 16, paddingBottom: 80 },
  messageBubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: '#dcb6ff', alignSelf: 'flex-end', borderTopRightRadius: 0 },
  botBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5d5ff', alignSelf: 'flex-start', borderTopLeftRadius: 0 },
  messageText: { fontSize: 14, color: '#333' },

  featuresGrid: { padding: 10 },
  featureCard: {
    backgroundColor: '#ede3ff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: { marginRight: 12 },
  cardTitle: { color: '#653ca4', fontWeight: '700', fontSize: 15 },
  cardDesc: { fontSize: 12, color: '#7a6e91', marginTop: 2 },

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
  sendButton: { backgroundColor: '#a472f2', borderRadius: 20, padding: 10 },
  sendText: { color: '#fff', fontSize: 16 },

  modalSafeArea: { flex: 1, backgroundColor: '#f9f7ff' },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    flex: 1,
  },
  modalTitle: { fontSize: 18, marginBottom: 12, fontWeight: 'bold', color: '#4c2b85' },
  projectInput: {
    borderColor: '#e0d4f7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    minHeight: 90,
    marginBottom: 12,
    textAlignVertical: 'top',
    backgroundColor: '#fdfaff',
  },
  modalButton: { backgroundColor: '#a472f2', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  modalButtonText: { color: '#fff', fontWeight: '600' },

  responseOutput: {
    flex: 1,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f6f0ff',
    borderWidth: 1,
    borderColor: '#e0d4f7',
  },
  modalClose: { marginTop: 12, alignItems: 'center' },

  // Markdown parsing styles
  numberedText: { fontSize: 14, marginTop: 6, color: '#333' },
  bulletText: { fontSize: 14, marginTop: 4, color: '#333' },
  normalText: { fontSize: 14, marginTop: 4, color: '#555' },
});

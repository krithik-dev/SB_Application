import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons } from "@expo/vector-icons";

const genAI = new GoogleGenerativeAI("AIzaSyAmNHYvm1khcNJHUJZrLXzMv6NQOI_2Hoo"); // ✅ Your API Key

export default function ProfileScreen() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "">("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!topic || !difficulty) return Alert.alert("Error", "Enter topic & select difficulty!");
    setLoading(true);
    setQuestions([]);
    setScore(0);
    setWeakAreas([]);
    setCurrentIndex(0);
    setShowResult(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
      Generate 5 ${difficulty} multiple-choice questions on "${topic}".
      Provide JSON format:
      [
        {"question":"...", "options":["A","B","C","D"], "answer":"B"}
      ]
      `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      setQuestions(parsed);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to generate quiz. Try again.");
    }
    setLoading(false);
  };

  const handleAnswer = async (option: string) => {
    if (!questions[currentIndex]) return;
    const correct = questions[currentIndex].answer;
    setSelectedOption(option);

    if (option === correct) {
      setScore((prev) => prev + 1);
      setFeedback("✅ Correct!");
    } else {
      setWeakAreas((prev) => [...prev, questions[currentIndex].question]);
      // AI-generated explanation for wrong answers
      const explanation = await generateExplanation(
        questions[currentIndex].question,
        correct,
        option,
        topic
      );
      setFeedback(`❌ Wrong! Correct: ${correct}\n💡 ${explanation}`);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setShowResult(true);
      }
    }, 3000);
  };

  const generateExplanation = async (question: string, correct: string, userAnswer: string, topic: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const explanationPrompt = `Explain in 2-3 sentences why "${userAnswer}" is incorrect for the question "${question}" on ${topic} and why "${correct}" is the correct answer.`;
      const result = await model.generateContent(explanationPrompt);
      return result.response.text();
    } catch {
      return "Could not generate explanation.";
    }
  };

  const restartQuiz = () => {
    setTopic("");
    setDifficulty("");
    setQuestions([]);
    setShowResult(false);
  };

  const renderQuestion = () => {
    const q = questions[currentIndex];
    if (!q) return null;
    return (
      <View style={styles.quizCard}>
        <Text style={styles.question}>{`Q${currentIndex + 1}. ${q.question}`}</Text>
        {q.options.map((opt: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.optionButton,
              selectedOption === opt && opt === q.answer && { backgroundColor: "#d4edda" },
              selectedOption === opt && opt !== q.answer && { backgroundColor: "#f8d7da" },
            ]}
            disabled={!!selectedOption}
            onPress={() => handleAnswer(opt)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
        {feedback && <Text style={styles.feedback}>{feedback}</Text>}
      </View>
    );
  };

  const renderResult = () => (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>🎯 Quiz Completed!</Text>
      <Text style={styles.resultScore}>Score: {score} / {questions.length}</Text>
      {weakAreas.length > 0 ? (
        <>
          <Text style={styles.weakTitle}>Focus on these areas:</Text>
          {weakAreas.map((w, i) => (
            <Text key={i} style={styles.weakPoint}>• {w}</Text>
          ))}
        </>
      ) : (
        <Text style={styles.perfect}>🔥 Perfect! You're strong in {topic}!</Text>
      )}
      <TouchableOpacity style={styles.retryButton} onPress={restartQuiz}>
        <Ionicons name="refresh" size={18} color="white" />
        <Text style={styles.retryText}>Try Another Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {!questions.length && !loading ? (
          <>
            <Text style={styles.header}>AI Practice Quiz</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Topic (e.g. Python, DevOps)"
              placeholderTextColor="#666"
              value={topic}
              onChangeText={setTopic}
            />
            <Text style={styles.label}>Select Difficulty</Text>
            <View style={styles.diffRow}>
              {["Easy", "Medium", "Hard"].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.diffBtn, difficulty === d && styles.diffSelected]}
                  onPress={() => setDifficulty(d as any)}
                >
                  <Text style={styles.diffText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.generateBtn} onPress={generateQuiz}>
              <Ionicons name="bulb" size={18} color="white" />
              <Text style={styles.generateText}>Generate Quiz</Text>
            </TouchableOpacity>
          </>
        ) : loading ? (
          <ActivityIndicator size="large" color="#7a5fff" />
        ) : showResult ? (
          renderResult()
        ) : (
          renderQuestion()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flexGrow: 1, padding: 16 },
  header: { fontSize: 26, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "#fff", color: "#333", padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: "#ddd" },
  label: { color: "#555", fontSize: 16, marginBottom: 8 },
  diffRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  diffBtn: { paddingVertical: 8, paddingHorizontal: 20, backgroundColor: "#eee", borderRadius: 8 },
  diffSelected: { backgroundColor: "#7a5fff" },
  diffText: { color: "#333", fontWeight: "600" },
  generateBtn: { flexDirection: "row", backgroundColor: "#7a5fff", padding: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  generateText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  quizCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#ddd" },
  question: { color: "#222", fontSize: 18, marginBottom: 16 },
  optionButton: { backgroundColor: "#f1f1f1", padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#ddd" },
  optionText: { color: "#333", fontSize: 16 },
  feedback: { marginTop: 10, color: "#444", fontWeight: "600" },
  resultCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#ddd" },
  resultTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  resultScore: { fontSize: 18, color: "#7a5fff", marginBottom: 16 },
  weakTitle: { color: "#ff6600", fontWeight: "600", marginBottom: 6 },
  weakPoint: { color: "#555", fontSize: 14 },
  perfect: { color: "#28a745", fontWeight: "600" },
  retryButton: { flexDirection: "row", marginTop: 20, backgroundColor: "#7a5fff", padding: 12, borderRadius: 8 },
  retryText: { color: "white", marginLeft: 6 },
});

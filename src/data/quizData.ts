// src/data/quizData.ts

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string; // correct answer
};

export const quizData: Record<string, QuizQuestion[]> = {
  // Introduction section
  'intro-1': [
    {
      question: 'What is Python primarily used for?',
      options: ['Web development', 'Game development', 'General-purpose programming', 'Mobile apps'],
      answer: 'General-purpose programming',
    },
  ],
  'intro-2': [
    {
      question: 'Which of these is a correct Python variable name?',
      options: ['2name', 'my name', 'my_name', 'my-name'],
      answer: 'my_name',
    },
  ],
  'intro-3': [
    {
      question: 'Where can you download Python?',
      options: ['python.com', 'py.org', 'python.org', 'python.dev'],
      answer: 'python.org',
    },
  ],
  'intro-4': [
    {
      question: 'Which IDE is popular for Python development?',
      options: ['Eclipse', 'PyCharm', 'Visual Studio', 'Android Studio'],
      answer: 'PyCharm',
    },
  ],
  'intro-5': [
    {
      question: 'What function prints output in Python?',
      options: ['echo()', 'print()', 'console.log()', 'printf()'],
      answer: 'print()',
    },
  ],

  // Fundamentals section
  'fund-1': [
    {
      question: 'Which keyword is used to define a variable in Python?',
      options: ['var', 'let', 'define', 'No keyword needed'],
      answer: 'No keyword needed',
    },
  ],
  'fund-2': [
    {
      question: 'What is the index of the first element in a Python list?',
      options: ['0', '1', '-1', 'Depends on list'],
      answer: '0',
    },
  ],
  'fund-3': [
    {
      question: 'How do you define a function in Python?',
      options: ['function myFunc()', 'def myFunc():', 'func myFunc()', 'define myFunc():'],
      answer: 'def myFunc():',
    },
  ],
  'fund-4': [
    {
      question: 'Which of the following is a mutable data structure?',
      options: ['Tuple', 'List', 'Set', 'Both List and Set'],
      answer: 'Both List and Set',
    },
  ],

  // Advanced section
  'adv-1': [
    {
      question: 'How do you import a module in Python?',
      options: ['#include', 'require()', 'import module_name', 'use module_name'],
      answer: 'import module_name',
    },
  ],
  'adv-2': [
    {
      question: 'Which keyword is used to define a class in Python?',
      options: ['object', 'struct', 'define', 'class'],
      answer: 'class',
    },
  ],
};

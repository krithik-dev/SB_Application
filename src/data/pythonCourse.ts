// src/data/pythonCourse.ts

export type Lesson = {
  id: string;
  title: string;
  isLocked: boolean;
  isCompleted: boolean;
};

export type Section = {
  id: string;
  title: string;
  progress: number; // percentage
  lessons: Lesson[];
};

export const pythonCourse: Section[] = [
  {
    id: 'intro',
    title: 'Introduction to Python',
    progress: 34,
    lessons: [
      { id: 'intro-1', title: 'Introduction to Python', isLocked: false, isCompleted: true },
      { id: 'intro-2', title: 'Basics of Python Syntax', isLocked: false, isCompleted: false },
      { id: 'intro-3', title: 'Python Installation', isLocked: true, isCompleted: false },
      { id: 'intro-4', title: 'Python setup in IDE', isLocked: true, isCompleted: false },
      { id: 'intro-5', title: 'Running first Python program', isLocked: true, isCompleted: false },
    ],
  },
  {
    id: 'fundamentals',
    title: 'Python Fundamentals',
    progress: 0,
    lessons: [
      { id: 'fund-1', title: 'Variables and Constants', isLocked: true, isCompleted: false },
      { id: 'fund-2', title: 'Lists and Arrays', isLocked: true, isCompleted: false },
      { id: 'fund-3', title: 'Functions in Python', isLocked: true, isCompleted: false },
      { id: 'fund-4', title: 'Tuples, Dictionaries & Sets', isLocked: true, isCompleted: false },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Python',
    progress: 0,
    lessons: [
      { id: 'adv-1', title: 'Modules in Python', isLocked: true, isCompleted: false },
      { id: 'adv-2', title: 'Object-Oriented Programming', isLocked: true, isCompleted: false },
    ],
  },
];

export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: 'Biology' | 'Math' | 'Physics' | 'Chemistry';
  description: string;
  content?: string;
}

export interface Submission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: 'pending' | 'marked';
  grade?: string;
}

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PenTool, 
  User as UserIcon, 
  BarChart3, 
  GraduationCap, 
  Upload, 
  Zap,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
  BookMarked,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Markdown from 'react-markdown';
import { User, UserRole, Lesson, Submission, QuizQuestion } from './types';
import { generateQuiz, explainTopic } from './services/geminiService';
import { cn } from './lib/utils';

// --- CONSTANTS ---
const DEFAULT_TEACHER: User = { id: 't1', name: 'Dr. Sarah Smith', email: 'sarah@somatext.edu', role: 'teacher' };
const DEFAULT_STUDENT: User = { id: 's1', name: 'Alex Johnson', email: 'alex@student.edu', role: 'student' };

// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className, title, onClick }: { children: React.ReactNode, className?: string, title?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden", 
      onClick && "cursor-pointer hover:shadow-md transition-shadow",
      className
    )}
  >
    {title && (
      <div className="px-6 py-4 border-bottom border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// --- TEACHER VIEWS ---

const TeacherDashboard = ({ stats }: { stats: any[] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-indigo-50 border-indigo-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-lg text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-indigo-600 font-medium">Active Students</p>
            <h4 className="text-2xl font-bold text-slate-900">124</h4>
          </div>
        </div>
      </Card>
      <Card className="bg-emerald-50 border-emerald-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 rounded-lg text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-emerald-600 font-medium">Avg. Performance</p>
            <h4 className="text-2xl font-bold text-slate-900">84%</h4>
          </div>
        </div>
      </Card>
      <Card className="bg-amber-50 border-amber-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-600 rounded-lg text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Pending Marking</p>
            <h4 className="text-2xl font-bold text-slate-900">18</h4>
          </div>
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Submission Trends">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="submissions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Class Average (Weekly)">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  </div>
);

const MarkingQueue = ({ submissions }: { submissions: Submission[] }) => (
  <Card title="Marking Queue">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="pb-4 font-semibold text-slate-600 text-sm">Student</th>
            <th className="pb-4 font-semibold text-slate-600 text-sm">Assignment</th>
            <th className="pb-4 font-semibold text-slate-600 text-sm">Submitted</th>
            <th className="pb-4 font-semibold text-slate-600 text-sm">Status</th>
            <th className="pb-4 font-semibold text-slate-600 text-sm">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {submissions.map((sub) => (
            <tr key={sub.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="py-4 text-slate-800 font-medium">{sub.studentName}</td>
              <td className="py-4 text-slate-600">{sub.assignmentTitle}</td>
              <td className="py-4 text-slate-500 text-sm">{sub.submittedAt}</td>
              <td className="py-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  sub.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                </span>
              </td>
              <td className="py-4">
                <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1">
                  {sub.status === 'pending' ? 'Mark Now' : 'View Details'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// --- STUDENT VIEWS ---

const LibraryHome = ({ lessons }: { lessons: Lesson[] }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLoading(true);
    try {
      const content = await explainTopic(lesson.title);
      setExplanation(content || "No content available.");
    } catch (err) {
      setExplanation("Failed to load lesson content.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedLesson) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Library
        </button>
        <Card title={selectedLesson.title}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse">AI is preparing your lesson...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <Markdown>{explanation || ""}</Markdown>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="hover:border-indigo-200 transition-all cursor-pointer group" onClick={() => handleLessonSelect(lesson)}>
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wider">
              {lesson.subject}
            </span>
            <BookOpen className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-2">{lesson.description}</p>
          <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm">
            Start Learning
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      ))}
    </div>
  );
};

const QuizCenter = () => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = async () => {
    if (!topic) return;
    setLoading(true);
    setQuiz([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    try {
      const questions = await generateQuiz(topic);
      setQuiz(questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (answer === quiz[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }
    
    if (currentQuestion + 1 < quiz.length) {
      setCurrentQuestion(c => c + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!quiz.length && !loading && (
        <Card title="Practice Quiz Generator">
          <p className="text-slate-500 mb-6">Enter a topic you want to practice, and our AI will generate a custom quiz for you.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. Photosynthesis, Algebra, World War II"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <button 
              onClick={startQuiz}
              disabled={!topic}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Generate
            </button>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Crafting your personalized quiz...</p>
        </Card>
      )}

      {quiz.length > 0 && !showResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Question {currentQuestion + 1} of {quiz.length}</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-8">{quiz[currentQuestion].question}</h3>
            <div className="grid grid-cols-1 gap-3">
              {quiz[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className="p-4 text-left rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-slate-700 hover:text-indigo-700"
                >
                  {option}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {showResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="text-center py-12">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
            <p className="text-slate-500 mb-8">You scored <span className="text-indigo-600 font-bold">{score}</span> out of <span className="font-bold">{quiz.length}</span></p>
            <button 
              onClick={() => { setQuiz([]); setTopic(''); }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Try Another Topic
            </button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const AssignmentUpload = ({ submissions, onSubmit }: { submissions: Submission[], onSubmit: (title: string) => void }) => {
  const [title, setTitle] = useState('');

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Submit Assignment">
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Assignment Title"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div 
            onClick={() => title && onSubmit(title)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer group"
          >
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload your work</h3>
            <p className="text-slate-500 text-sm mb-6">Enter a title and click here to submit</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="font-bold text-slate-800 mb-4">Recent Submissions</h4>
          <div className="space-y-3">
            {submissions.filter(s => s.studentName === 'Alex Johnson').map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BookMarked className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{sub.assignmentTitle}</p>
                    <p className="text-xs text-slate-500">{sub.submittedAt}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  sub.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- APP STATE & API ---

export default function App() {
  const [role, setRole] = useState<UserRole>('teacher');
  const [activeTab, setActiveTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const user = role === 'teacher' ? DEFAULT_TEACHER : DEFAULT_STUDENT;

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [subsRes, lessonsRes, statsRes] = await Promise.all([
        fetch('/api/submissions'),
        fetch('/api/lessons'),
        fetch('/api/stats')
      ]);
      const [subs, less, st] = await Promise.all([
        subsRes.json(),
        lessonsRes.json(),
        statsRes.json()
      ]);
      setSubmissions(subs);
      setLessons(less);
      setStats(st);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmission = async (title: string) => {
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: user.name, assignmentTitle: title })
      });
      fetchData();
    } catch (err) {
      console.error("Failed to submit", err);
    }
  };

  const teacherTabs = [
    { id: 'stats', label: 'Stats', icon: BarChart3, component: <TeacherDashboard stats={stats} /> },
    { id: 'marking', label: 'Marking', icon: PenTool, component: <MarkingQueue submissions={submissions} /> },
    { id: 'profile', label: 'Profile', icon: UserIcon, component: <div className="p-12 text-center text-slate-400">Profile Settings (Coming Soon)</div> },
  ];

  const studentTabs = [
    { id: 'soma', label: 'Soma', icon: BookOpen, component: <LibraryHome lessons={lessons} /> },
    { id: 'practice', label: 'Practice', icon: Zap, component: <QuizCenter /> },
    { id: 'submit', label: 'Submit', icon: Upload, component: <AssignmentUpload submissions={submissions} onSubmit={handleSubmission} /> },
  ];

  const tabs = role === 'teacher' ? teacherTabs : studentTabs;

  // Reset tab when role changes
  useEffect(() => {
    setActiveTab(0);
  }, [role]);

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex font-sans text-slate-900">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              SomaText
            </h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {tabs.map((tab, idx) => (
            <SidebarItem 
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === idx}
              onClick={() => {
                setActiveTab(idx);
                setIsSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setRole(role === 'teacher' ? 'student' : 'teacher');
                setIsSidebarOpen(false);
              }}
              className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Switch to {role === 'teacher' ? 'Student' : 'Teacher'}
            </button>
          </div>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                {tabs[activeTab].label} Hub
              </h2>
              <p className="text-sm text-slate-500">Welcome back, {user.name.split(' ')[0]}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search lessons..." 
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabs[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("somatext.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentName TEXT,
    assignmentTitle TEXT,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    grade TEXT
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subject TEXT,
    description TEXT
  );
`);

// Seed data if empty
const submissionCount = db.prepare("SELECT count(*) as count FROM submissions").get() as { count: number };
if (submissionCount.count === 0) {
  db.prepare("INSERT INTO submissions (studentName, assignmentTitle, status) VALUES (?, ?, ?)").run('Alex Johnson', 'Cell Mitosis Essay', 'pending');
  db.prepare("INSERT INTO submissions (studentName, assignmentTitle, status) VALUES (?, ?, ?)").run('Jamie Voe', 'Quadratic Equations', 'pending');
  db.prepare("INSERT INTO submissions (studentName, assignmentTitle, status, grade) VALUES (?, ?, ?, ?)").run('Sam Lee', 'Photosynthesis Lab', 'marked', 'A');
}

const lessonCount = db.prepare("SELECT count(*) as count FROM lessons").get() as { count: number };
if (lessonCount.count === 0) {
  db.prepare("INSERT INTO lessons (title, subject, description) VALUES (?, ?, ?)").run('Human Circulatory System', 'Biology', 'Understanding how blood travels through the heart and vessels.');
  db.prepare("INSERT INTO lessons (title, subject, description) VALUES (?, ?, ?)").run('Calculus: Derivatives', 'Math', 'Introduction to the power rule and basic differentiation.');
  db.prepare("INSERT INTO lessons (title, subject, description) VALUES (?, ?, ?)").run('Organic Chemistry Basics', 'Chemistry', 'Carbon bonding and functional groups explained.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/submissions", (req, res) => {
    const submissions = db.prepare("SELECT * FROM submissions ORDER BY submittedAt DESC").all();
    res.json(submissions);
  });

  app.post("/api/submissions", (req, res) => {
    const { studentName, assignmentTitle } = req.body;
    const info = db.prepare("INSERT INTO submissions (studentName, assignmentTitle) VALUES (?, ?)").run(studentName, assignmentTitle);
    res.json({ id: info.lastInsertRowid, status: 'success' });
  });

  app.get("/api/lessons", (req, res) => {
    const lessons = db.prepare("SELECT * FROM lessons").all();
    res.json(lessons);
  });

  app.get("/api/stats", (req, res) => {
    // Mock stats for the chart but could be derived from DB
    const stats = [
      { name: 'Mon', submissions: 12, average: 78 },
      { name: 'Tue', submissions: 19, average: 82 },
      { name: 'Wed', submissions: 15, average: 75 },
      { name: 'Thu', submissions: 22, average: 88 },
      { name: 'Fri', submissions: 30, average: 85 },
    ];
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("rounding.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    hospitalId TEXT,
    employeeId TEXT,
    email TEXT,
    password TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomNumber TEXT UNIQUE,
    unit TEXT,
    department TEXT,
    hospitalId TEXT
  );

  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    managerId TEXT,
    managerName TEXT,
    department TEXT,
    patientRoom TEXT,
    patientName TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    dayOfWeek TEXT,
    isWeekend BOOLEAN,
    mood TEXT,
    notes TEXT,
    durationMinutes INTEGER,
    authenticityScore REAL,
    sentimentScore REAL,
    checklistData TEXT -- JSON string for department specific questions
  );

  CREATE TABLE IF NOT EXISTS manager_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    managerId TEXT,
    managerName TEXT,
    feedback TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    type TEXT, -- 'Behavioral' or 'Quality'
    status TEXT DEFAULT 'Pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS managers (
    id TEXT PRIMARY KEY,
    employeeId TEXT UNIQUE,
    name TEXT,
    email TEXT,
    department TEXT,
    role TEXT,
    status TEXT DEFAULT 'active',
    roundsCount INTEGER DEFAULT 0,
    hospitalId TEXT,
    permissions TEXT -- JSON string array of view IDs
  );
`);

// Migration: Add permissions column if it doesn't exist
try {
  db.prepare("ALTER TABLE managers ADD COLUMN permissions TEXT").run();
} catch (e) {
  // Column already exists or table doesn't exist yet (handled by CREATE TABLE)
}

// Add default manager if none exist
const mgrCount = db.prepare("SELECT COUNT(*) as count FROM managers").get() as any;
if (mgrCount.count === 0) {
  db.prepare("INSERT INTO managers (id, employeeId, name, email, department, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    'MGR-1', '12345', 'John Doe', 'john.doe@hospital.com', 'Emergency', 'Nurse Manager', 'active', JSON.stringify(['rounding', 'leadership', 'manager', 'satisfaction'])
  );
}

// Ensure Director account exists
const directorExists = db.prepare("SELECT COUNT(*) as count FROM managers WHERE employeeId = ?").get('99999') as any;
if (directorExists.count === 0) {
  db.prepare("INSERT INTO managers (id, employeeId, name, email, department, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
    'DIR-1', '99999', 'Director Sarah', 'sarah.director@hospital.com', 'Administration', 'Director', 'active', JSON.stringify(['rounding', 'leadership', 'manager', 'director', 'satisfaction', 'dashboard', 'strategy', 'rooms', 'flyer', 'leadership_outcomes'])
  );
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/hospitals", (req, res) => {
    const hospitals = db.prepare("SELECT * FROM hospitals").all();
    res.json(hospitals);
  });

  app.post("/api/hospitals", (req, res) => {
    const { name, location } = req.body;
    const id = `HOSP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    db.prepare("INSERT INTO hospitals (id, name, location) VALUES (?, ?, ?)").run(id, name, location);
    res.json({ id });
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { name, role, hospitalId, employeeId, email, password } = req.body;
    const id = `USR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    db.prepare("INSERT INTO users (id, name, role, hospitalId, employeeId, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, name, role, hospitalId, employeeId, email, password
    );
    res.json({ id });
  });

  app.get("/api/rooms", (req, res) => {
    const { hospitalId } = req.query;
    let rooms;
    if (hospitalId) {
      rooms = db.prepare("SELECT * FROM rooms WHERE hospitalId = ? ORDER BY roomNumber ASC").all(hospitalId);
    } else {
      rooms = db.prepare("SELECT * FROM rooms ORDER BY roomNumber ASC").all();
    }
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const { roomNumber, unit, department, hospitalId } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO rooms (roomNumber, unit, department, hospitalId) VALUES (?, ?, ?, ?)");
      const result = stmt.run(roomNumber, unit, department, hospitalId);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Room already exists" });
    }
  });

  app.delete("/api/rooms/:id", (req, res) => {
    db.prepare("DELETE FROM rooms WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/rounds", (req, res) => {
    const { hospitalId } = req.query;
    let rounds;
    if (hospitalId) {
      rounds = db.prepare(`
        SELECT r.* FROM rounds r 
        JOIN managers m ON r.managerId = m.id 
        WHERE m.hospitalId = ? 
        ORDER BY r.timestamp DESC
      `).all(hospitalId);
    } else {
      rounds = db.prepare("SELECT * FROM rounds ORDER BY timestamp DESC").all();
    }
    res.json(rounds.map((r: any) => ({ 
      ...r, 
      isWeekend: r.isWeekend === 1,
      checklistData: r.checklistData ? JSON.parse(r.checklistData) : {} 
    })));
  });

  app.post("/api/rounds", (req, res) => {
    const { 
      managerId, managerName, department, patientRoom, patientName, 
      mood, notes, durationMinutes, authenticityScore, sentimentScore,
      checklistData
    } = req.body;
    
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = [0, 6].includes(now.getDay());

    const stmt = db.prepare(`
      INSERT INTO rounds (
        managerId, managerName, department, patientRoom, patientName, 
        mood, notes, durationMinutes, authenticityScore, sentimentScore,
        dayOfWeek, isWeekend, checklistData
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      managerId, managerName, department, patientRoom, patientName, 
      mood, notes, durationMinutes, authenticityScore, sentimentScore,
      dayOfWeek, isWeekend ? 1 : 0,
      JSON.stringify(checklistData || {})
    );

    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/manager-feedback", (req, res) => {
    const feedback = db.prepare("SELECT * FROM manager_feedback ORDER BY timestamp DESC").all();
    res.json(feedback);
  });

  app.post("/api/manager-feedback", (req, res) => {
    const { managerId, managerName, feedback } = req.body;
    const stmt = db.prepare("INSERT INTO manager_feedback (managerId, managerName, feedback) VALUES (?, ?, ?)");
    const result = stmt.run(managerId, managerName, feedback);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/action-items", (req, res) => {
    const items = db.prepare("SELECT * FROM action_items ORDER BY createdAt DESC").all();
    res.json(items);
  });

  app.post("/api/action-items", (req, res) => {
    const { title, description, type } = req.body;
    const stmt = db.prepare("INSERT INTO action_items (title, description, type) VALUES (?, ?, ?)");
    const result = stmt.run(title, description, type);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/managers", (req, res) => {
    const managers = db.prepare("SELECT * FROM managers ORDER BY name ASC").all();
    res.json(managers.map((m: any) => ({
      ...m,
      permissions: m.permissions ? JSON.parse(m.permissions) : []
    })));
  });

  app.post("/api/managers", (req, res) => {
    const { id, employeeId, name, email, department, role, status, permissions } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO managers (id, employeeId, name, email, department, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, employeeId, name, email, department, role, status || 'active', JSON.stringify(permissions || []));
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Manager already exists or invalid data" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { employeeId } = req.body;
    const manager = db.prepare("SELECT * FROM managers WHERE employeeId = ? AND status = 'active'").get(employeeId) as any;
    if (manager) {
      res.json({
        ...manager,
        permissions: manager.permissions ? JSON.parse(manager.permissions) : []
      });
    } else {
      res.status(401).json({ error: "Invalid Employee ID or inactive account" });
    }
  });

  app.patch("/api/managers/:id", (req, res) => {
    const { id } = req.params;
    const { status, name, email, department, role, permissions, employeeId } = req.body;
    
    if (status && Object.keys(req.body).length === 1) {
      const stmt = db.prepare("UPDATE managers SET status = ? WHERE id = ?");
      stmt.run(status, id);
    } else {
      const stmt = db.prepare(`
        UPDATE managers 
        SET name = ?, email = ?, department = ?, role = ?, permissions = ?, employeeId = ?
        WHERE id = ?
      `);
      stmt.run(name, email, department, role, JSON.stringify(permissions || []), employeeId, id);
    }
    res.json({ success: true });
  });

  app.delete("/api/managers/:id", (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM managers WHERE id = ?");
    stmt.run(id);
    res.json({ success: true });
  });

  app.get("/api/analytics/behavioral", (req, res) => {
    const { hospitalId } = req.query;
    let stats;
    if (hospitalId) {
      stats = db.prepare(`
        SELECT 
          r.managerName,
          COUNT(*) as totalRounds,
          AVG(r.authenticityScore) as avgAuthenticity,
          AVG(r.sentimentScore) as avgSentiment,
          SUM(CASE WHEN r.dayOfWeek = 'Friday' AND strftime('%H', r.timestamp) >= '14' THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as fridayRushRatio,
          SUM(CASE WHEN r.isWeekend = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as weekendRatio
        FROM rounds r
        JOIN managers m ON r.managerId = m.id
        WHERE m.hospitalId = ?
        GROUP BY r.managerId
      `).all(hospitalId);
    } else {
      stats = db.prepare(`
        SELECT 
          managerName,
          COUNT(*) as totalRounds,
          AVG(authenticityScore) as avgAuthenticity,
          AVG(sentimentScore) as avgSentiment,
          SUM(CASE WHEN dayOfWeek = 'Friday' AND strftime('%H', timestamp) >= '14' THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as fridayRushRatio,
          SUM(CASE WHEN isWeekend = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as weekendRatio
        FROM rounds
        GROUP BY managerId
      `).all();
    }
    res.json(stats);
  });

  // Developer Endpoint: Get Source Code
  app.get("/api/dev/source", (req, res) => {
    const files: { path: string, content: string }[] = [];
    
    const readDir = (dir: string) => {
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.next') {
            readDir(fullPath);
          }
        } else {
          const relativePath = path.relative(__dirname, fullPath);
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({ path: relativePath, content });
        }
      });
    };

    try {
      // Read root files
      const rootFiles = ['package.json', 'server.ts', 'vite.config.ts', 'tsconfig.json', 'index.html', 'metadata.json', '.env.example'];
      rootFiles.forEach(f => {
        const p = path.join(__dirname, f);
        if (fs.existsSync(p)) {
          files.push({ path: f, content: fs.readFileSync(p, 'utf-8') });
        }
      });

      // Read src directory
      readDir(path.join(__dirname, 'src'));

      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to read source code" });
    }
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

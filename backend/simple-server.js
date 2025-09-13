const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'falcon_pass.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    client_salt TEXT NOT NULL,
    verifier TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Vault entries table
  db.run(`CREATE TABLE IF NOT EXISTS vault_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`);

  console.log('Database tables initialized');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FalconPass Backend is running' });
});

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // For demo purposes, we'll use a mock user ID
  req.user = { userId: 'demo-user-123' };
  next();
};

// Vault routes
app.get('/api/vault', mockAuth, (req, res) => {
  const userId = req.user.userId;
  
  db.all(
    'SELECT * FROM vault_entries WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Return mock data for now
      const mockEntries = [
        {
          id: '1',
          userId: userId,
          encryptedData: 'mock-encrypted-data-1',
          metadata: JSON.stringify({
            title: 'Gmail',
            url: 'https://gmail.com',
            category: 'Email',
            tags: ['work', 'personal'],
            lastModified: new Date().toISOString()
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: userId,
          encryptedData: 'mock-encrypted-data-2',
          metadata: JSON.stringify({
            title: 'GitHub',
            url: 'https://github.com',
            category: 'Development',
            tags: ['coding', 'repos'],
            lastModified: new Date().toISOString()
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      res.json(mockEntries);
    }
  );
});

app.post('/api/vault', mockAuth, (req, res) => {
  const userId = req.user.userId;
  const { encryptedData, metadata } = req.body;
  
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  db.run(
    'INSERT INTO vault_entries (id, user_id, encrypted_data, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, encryptedData, JSON.stringify(metadata || {}), now, now],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        id,
        userId,
        encryptedData,
        metadata: metadata || {},
        createdAt: now,
        updatedAt: now
      });
    }
  );
});

app.get('/api/vault/:id', mockAuth, (req, res) => {
  const userId = req.user.userId;
  const entryId = req.params.id;
  
  db.get(
    'SELECT * FROM vault_entries WHERE id = ? AND user_id = ?',
    [entryId, userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      res.json(row);
    }
  );
});

app.put('/api/vault/:id', mockAuth, (req, res) => {
  const userId = req.user.userId;
  const entryId = req.params.id;
  const { encryptedData, metadata } = req.body;
  
  db.run(
    'UPDATE vault_entries SET encrypted_data = ?, metadata = ?, updated_at = ? WHERE id = ? AND user_id = ?',
    [encryptedData, JSON.stringify(metadata || {}), new Date().toISOString(), entryId, userId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      res.json({ success: true, id: entryId });
    }
  );
});

app.delete('/api/vault/:id', mockAuth, (req, res) => {
  const userId = req.user.userId;
  const entryId = req.params.id;
  
  db.run(
    'DELETE FROM vault_entries WHERE id = ? AND user_id = ?',
    [entryId, userId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      res.json({ success: true });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`FalconPass Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Crear tabla e insertar un registro
db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run('testuser', 'password123');
  stmt.finalize();
});

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err) {
        res.status(500).send('Internal Server Error');
      } else if (row) {
        res.send('Login successful!');
      } else {
        res.status(401).send('Invalid username or password');
      }
    }
  );
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Base de données
const db = new sqlite3.Database('./echo_des_vagues.db');

// Créer les tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS excursions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    duration TEXT NOT NULL,
    description TEXT,
    available BOOLEAN DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_number TEXT UNIQUE,
    excursion_id INTEGER,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    reservation_date TEXT NOT NULL,
    number_of_people INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Routes simples
app.get('/', (req, res) => {
  res.json({ message: 'Serveur Echo des Vagues - Pret', version: '1.0' });
});

app.get('/api/excursions', (req, res) => {
  db.all('SELECT * FROM excursions WHERE available = 1', [], (err, rows) => {
    if (err) {
      res.status(500).json({error: 'Database error'});
      return;
    }
    res.json(rows);
  });
});

app.post('/api/reservations', (req, res) => {
  const {excursion_id, name, email, date, number_of_people} = req.body;
  
  if (!excursion_id || !name || !email || !date || !number_of_people) {
    return res.status(400).json({error: 'Missing fields'});
  }
  
  // Vérifier excursion
  db.get('SELECT * FROM excursions WHERE id = ?', [excursion_id], (err, excursion) => {
    if (err) {
      return res.status(500).json({error: 'Database error'});
    }
    if (!excursion) {
      return res.status(404).json({error: 'Excursion not found'});
    }
    
    const total = excursion.price * number_of_people;
    const reservationNumber = 'EDV' + Date.now().toString(36).toUpperCase();
    
    db.run(
      'INSERT INTO reservations (reservation_number, excursion_id, client_name, client_email, reservation_date, number_of_people, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [reservationNumber, excursion_id, name, email, date, number_of_people, total],
      function(err) {
        if (err) {
          res.status(500).json({error: 'Failed to create reservation'});
          return;
        }
        res.json({
          message: 'Reservation created successfully',
          reservation_number: reservationNumber,
          total_amount: total
        });
      }
    );
  });
});

app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM reservations', [], (err, row) => {
    if (err) {
      res.status(500).json({error: 'Database error'});
      return;
    }
    res.json({
      total_reservations: row.count,
      total_revenue: row.revenue || 0
    });
  });
});

app.get('/api/reservations', (req, res) => {
  db.all(`
    SELECT r.*, e.name as excursion_name
    FROM reservations r
    JOIN excursions e ON r.excursion_id = e.id
    ORDER BY r.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({error: 'Database error'});
      return;
    }
    res.json(rows);
  });
});

// Démarrer
app.listen(PORT, () => {
  console.log('');
  console.log('=====================================');
  console.log('🌊 ECHO DES VAGUES - SERVER READY');
  console.log('=====================================');
  console.log('📍 URL: http://localhost:' + PORT);
  console.log('=====================================');
});

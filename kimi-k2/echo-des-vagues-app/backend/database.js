const sqlite3 = require('sqlite3').verbose(); 
const path = require('path'); 
 
const db = new sqlite3.Database('./echo_des_vagues.db'); 
 
// Cr‚er les tables 
db.serialize(() => { 
  // Table excursions 
  db.run(`CREATE TABLE IF NOT EXISTS excursions ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL, 
    price INTEGER NOT NULL, 
    duration TEXT NOT NULL, 
    description TEXT, 
    available BOOLEAN DEFAULT 1 
  )`); 
 
  // Table reservations 
  db.run(`CREATE TABLE IF NOT EXISTS reservations ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    reservation_number TEXT UNIQUE, 
    excursion_id INTEGER, 
    client_name TEXT NOT NULL, 
    client_email TEXT NOT NULL, 
    reservation_date TEXT NOT NULL, 
    number_of_people INTEGER NOT NULL, 
    total_amount INTEGER NOT NULL, 
    status TEXT DEFAULT 'pending', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (excursion_id) REFERENCES excursions (id) 
  )`); 
}); 
 
// Fonctions pour les excursions 
const getAllExcursions = (callback) => { 
  db.all('SELECT * FROM excursions WHERE available = 1', callback); 
}; 
 
const getExcursionById = (id, callback) => { 
  db.get('SELECT * FROM excursions WHERE id = ?', [id], callback); 
}; 
 
// Fonctions pour les r‚servations 
const createReservation = (reservationData, callback) => { 
  const { reservation_number, excursion_id, client_name, client_email, reservation_date, number_of_people, total_amount } = reservationData; 
  db.run( 
    'INSERT INTO reservations (reservation_number, excursion_id, client_name, client_email, reservation_date, number_of_people, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [reservation_number, excursion_id, client_name, client_email, reservation_date, number_of_people, total_amount], 
    function(err) { 
      callback(err, { id: this.lastID, reservation_number }); 
    } 
  ); 
}; 
 
const getAllReservations = (callback) => { 
  db.all(` 
    SELECT r.*, e.name as excursion_name 
    FROM reservations r 
    JOIN excursions e ON r.excursion_id = e.id 
    ORDER BY r.created_at DESC 
  `, callback); 
}; 
 
const getReservationByNumber = (number, callback) => { 
  db.get(` 
    SELECT r.*, e.name as excursion_name, e.price as excursion_price 
    FROM reservations r 
    JOIN excursions e ON r.excursion_id = e.id 
    WHERE r.reservation_number = ? 
  `, [number], callback); 
}; 
 
// Initialiser avec des donn‚es 
const initializeData = () => { 
  const excursions = [ 
    { name: 'Bonifacio', price: 85, duration: '6h', description: 'Falaises de calcaire blanc' }, 
    { name: 'Coucher de soleil', price: 65, duration: '3h', description: 'Observation dauphins au coucher du soleil' } 
  ]; 
 
  excursions.forEach(excursion => { 
    db.run('INSERT OR IGNORE INTO excursions (name, price, duration, description) VALUES (?, ?, ?, ?)', 
      [excursion.name, excursion.price, excursion.duration, excursion.description]); 
  }); 
}; 
 
module.exports = { 
  db, 
  getAllExcursions, 
  getExcursionById, 
  createReservation, 
  getAllReservations, 
  getReservationByNumber, 
  initializeData 
}; 

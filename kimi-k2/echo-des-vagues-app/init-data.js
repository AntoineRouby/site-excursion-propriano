// Insérer des données de test
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./echo_des_vagues.db');

db.serialize(() => {
  // Insérer les excursions
  db.run('INSERT OR IGNORE INTO excursions (id, name, price, duration, description) VALUES (?, ?, ?, ?, ?)',
    [1, 'Scandola et Piana', 95, '7h', 'Reserve naturelle UNESCO']);

  db.run('INSERT OR IGNORE INTO excursions (id, name, price, duration, description) VALUES (?, ?, ?, ?, ?)',
    [2, 'Bonifacio', 85, '6h', 'Falaises blanches et grottes']);

  db.run('INSERT OR IGNORE INTO excursions (id, name, price, duration, description) VALUES (?, ?, ?, ?, ?)',
    [3, 'Coucher de soleil', 65, '3h', 'Observation dauphins']);

  console.log('✅ Données initiales insérées');
});

db.close();

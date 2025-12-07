const sqlite3 = require('sqlite3').verbose(); 
const db = new sqlite3.Database('./echo_des_vagues.db'); 
 
// Statistiques globales 
const getGlobalStats = (callback) => { 
  const query = ` 
    SELECT 
      COUNT(*) as total_reservations, 
      SUM(total_amount) as total_revenue, 
      AVG(total_amount) as average_amount, 
      SUM(number_of_people) as total_passengers 
    FROM reservations 
  `; 
  db.get(query, callback); 
}; 
 
// Statistiques par excursion 
const getStatsByExcursion = (callback) => { 
  const query = ` 
    SELECT 
      e.name, 
      COUNT(r.id) as reservation_count, 
      SUM(r.total_amount) as revenue, 
      AVG(r.total_amount) as average_amount 
    FROM excursions e 
    LEFT JOIN reservations r ON e.id = r.excursion_id 
    GROUP BY e.id, e.name 
    ORDER BY reservation_count DESC 
  `; 
  db.all(query, callback); 
}; 
 
// R‚servations par mois 
const getMonthlyStats = (callback) => { 
  const query = ` 
    SELECT 
      strftime('%Y-%m', reservation_date) as month, 
      COUNT(*) as reservation_count, 
      SUM(total_amount) as revenue 
    FROM reservations 
    GROUP BY strftime('%Y-%m', reservation_date) 
    ORDER BY month DESC 
    LIMIT 12 
  `; 
  db.all(query, callback); 
}; 
 
// R‚servations r‚centes 
const getRecentReservations = (limit = 10, callback) => { 
  const query = ` 
    SELECT 
      r.reservation_number, 
      r.client_name, 
      r.client_email, 
      e.name as excursion_name, 
      r.reservation_date, 
      r.number_of_people, 
      r.total_amount, 
      r.status, 
      r.created_at 
    FROM reservations r 
    JOIN excursions e ON r.excursion_id = e.id 
    ORDER BY r.created_at DESC 
    LIMIT ? 
  `; 
  db.all(query, [limit], callback); 
}; 
 
// Rechercher une r‚servation 
const searchReservations = (searchTerm, callback) => { 
  const query = ` 
    SELECT 
      r.reservation_number, 
      r.client_name, 
      r.client_email, 
      e.name as excursion_name, 
      r.reservation_date, 
      r.number_of_people, 
      r.total_amount, 
      r.status 
    FROM reservations r 
    JOIN excursions e ON r.excursion_id = e.id 
    WHERE r.reservation_number LIKE ? OR r.client_name LIKE ? OR r.client_email LIKE ? 
    ORDER BY r.created_at DESC 
  `; 
  const searchPattern = `%${searchTerm}%`; 
  db.all(query, [searchPattern, searchPattern, searchPattern], callback); 
}; 
 
// Annuler une r‚servation 
const cancelReservation = (reservationNumber, callback) => { 
  const query = `UPDATE reservations SET status = 'cancelled' WHERE reservation_number = ?`; 
  db.run(query, [reservationNumber], function(err) { 
    callback(err, { changedRows: this.changes }); 
  }); 
}; 
 
module.exports = { 
  getGlobalStats, 
  getStatsByExcursion, 
  getMonthlyStats, 
  getRecentReservations, 
  searchReservations, 
  cancelReservation 
}; 

const express = require('express'); 
const cors = require('cors'); 
const { db, getAllExcursions, getExcursionById, createReservation, getAllReservations, getReservationByNumber, initializeData } = require('./database'); 
const { createDefaultAdmin, authenticate, requireAdmin, createUser, getAllUsers } = require('./auth'); 
 
const app = express(); 
const PORT = 5000; 
 
app.use(cors()); 
app.use(express.json()); 
 
// Initialiser les donnÇes et l'admin 
initializeData(); 
createDefaultAdmin(); 
 
// Routes publiques (pas d'authentification requise) 
app.get('/api', (req, res) => { 
  res.json({ message: '?? êcho des Vagues API - Avec Authentification', version: '2.0' }); 
}); 
 
app.get('/api/excursions', (req, res) => { 
  getAllExcursions((err, rows) => { 
    if (err) { 
      console.error('Erreur:', err); 
      return res.status(500).json({ error: 'Erreur serveur' }); 
    } 
    res.json(rows); 
  }); 
}); 
 
app.get('/api/excursions/:id', (req, res) => { 
  getExcursionById(req.params.id, (err, row) => { 
    if (err) { 
      console.error('Erreur:', err); 
      return res.status(500).json({ error: 'Erreur serveur' }); 
    } 
    if (!row) { 
      return res.status(404).json({ error: 'Excursion non trouvÇe' }); 
    } 
    res.json(row); 
  }); 
}); 
 
// Routes protÇgÇes (authentification requise) 
app.get('/api/admin/reservations', authenticate, requireAdmin, (req, res) => { 
  getAllReservations((err, rows) => { 
    if (err) { 
      console.error('Erreur:', err); 
      return res.status(500).json({ error: 'Erreur serveur' }); 
    } 
    res.json({ reservations: rows, total: rows.length }); 
  }); 
}); 
 
app.post('/api/reservations', (req, res) => { 
  const { excursion_id, name, email, date, number_of_people } = req.body; 
 
  // Validation 
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' }); 
  } 
 
  // VÇrifier que l'excursion existe 
  getExcursionById(excursion_id, (err, excursion) => { 
    if (err) { 
      console.error('Erreur:', err); 
      return res.status(500).json({ error: 'Erreur serveur' }); 
    } 
    if (!excursion) { 
      return res.status(404).json({ error: 'Excursion non trouvÇe' }); 
    } 
 
    // Calculer le montant total 
    const total_amount = excursion.price * number_of_people; 
 
    // GÇnÇrer un numÇro de rÇservation unique 
    const reservation_number = 'EDV' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase(); 
 
    // CrÇer la rÇservation 
    const reservationData = { 
      reservation_number, 
      excursion_id: parseInt(excursion_id), 
      client_name: name, 
      client_email: email, 
      reservation_date: date, 
      number_of_people: parseInt(number_of_people), 
      total_amount 
    }; 
 
    createReservation(reservationData, (err, result) => { 
      if (err) { 
        console.error('Erreur:', err); 
        return res.status(500).json({ error: 'Erreur lors de la crÇation de la rÇservation' }); 
      } 
      res.json({ 
        message: '? RÇservation crÇÇe avec succäs!', 
        reservation_number: result.reservation_number, 
        total_amount: total_amount, 
        status: 'confirmed' 
      }); 
    }); 
  }); 
}); 
 
app.get('/api/reservations/:number', (req, res) => { 
  getReservationByNumber(req.params.number, (err, row) => { 
    if (err) { 
      console.error('Erreur:', err); 
      return res.status(500).json({ error: 'Erreur serveur' }); 
    } 
    if (!row) { 
      return res.status(404).json({ error: 'RÇservation non trouvÇe' }); 
    } 
    res.json(row); 
  }); 
}); 
 
// Routes admin (authentification requise) 
app.get('/api/admin/stats', authenticate, requireAdmin, (req, res) => { 
  db.get('SELECT COUNT(*) as total_reservations, SUM(total_amount) as total_revenue FROM reservations', (err, row) => { 
    if (err) { 
      console.error('Erreur:', err); 
      return res.status(500).json({ error: 'Erreur serveur' }); 
    } 
    res.json({ 
      total_reservations: row.total_reservations, 
      total_revenue: row.total_revenue || 0 
    }); 
  }); 
}); 
 
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => { 
  const allUsers = getAllUsers(); 
  res.json({ users: allUsers }); 
}); 
 
// DÇmarrer le serveur 
app.listen(PORT, () => { 
  console.log(`? Serveur êcho des Vagues avec BDD + Auth sur http://localhost:${PORT}`); 
  console.log(`?? Admin - Username: admin, Password: admin123`); 
  console.log(`?? Stats: http://localhost:${PORT}/api/admin/stats`); 
  console.log(`?? RÇservations admin: http://localhost:${PORT}/api/admin/reservations`); 
}); 

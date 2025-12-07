const express = require('express'); 
const cors = require('cors'); 
const app = express(); 
const PORT = 5000; 
 
app.use(cors()); 
app.use(express.json()); 
 
// Base de donnÇes temporaire 
const excursions = [ 
  { 
    id: 1, 
    price: 95, 
    duration: '7h', 
    description: 'DÇcouverte de la rÇserve UNESCO', 
    available: true 
  }, 
  { 
    id: 2, 
    name: 'Bonifacio', 
    price: 85, 
    duration: '6h', 
    description: 'Falaises de calcaire blanc', 
    available: true 
  }, 
  { 
    id: 3, 
    name: 'Coucher de soleil', 
    price: 65, 
    duration: '3h', 
    description: 'Observation dauphins au coucher du soleil', 
    available: true 
  } 
]; 
 
// Routes 
app.get('/api/excursions', (req, res) => { 
  res.json(excursions); 
}); 
 
app.get('/api/excursions/:id', (req, res) => { 
  const excursion = excursions.find(e => e.id === parseInt(req.params.id)); 
  if (!excursion) return res.status(404).json({ error: 'Excursion non trouvÇe' }); 
  res.json(excursion); 
}); 
 
app.post('/api/reservations', (req, res) => { 
  const { excursionId, name, email, date, people } = req.body; 
  const excursion = excursions.find(e => e.id === parseInt(excursionId)); 
  if (!excursion) return res.status(404).json({ error: 'Excursion non trouvÇe' }); 
 
  const reservation = { 
    id: Date.now(), 
    excursion: excursion.name, 
    name, 
    email, 
    date, 
    people, 
    total: excursion.price * people 
  }; 
 
  res.json({ message: 'RÇservation reáue!', reservation }); 
}); 
 
app.listen(PORT, () => { 
  console.log(`? Serveur êcho des Vagues sur http://localhost:${PORT}`); 
}); 

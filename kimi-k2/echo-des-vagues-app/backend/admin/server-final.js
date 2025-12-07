const { getGlobalStats, getStatsByExcursion, getMonthlyStats, getRecentReservations } = require('./stats'); 
 
// Nouvelle route pour les statistiques complŠtes 
app.get('/api/admin/stats/complete', authenticate, requireAdmin, (req, res) => { 
  Promise.all([ 
    new Promise((resolve, reject) => getGlobalStats((err, data) => err ? reject(err) : resolve(data))), 
    new Promise((resolve, reject) => getStatsByExcursion((err, data) => err ? reject(err) : resolve(data))), 
    new Promise((resolve, reject) => getMonthlyStats((err, data) => err ? reject(err) : resolve(data))), 
    new Promise((resolve, reject) => getRecentReservations(20, (err, data) => err ? reject(err) : resolve(data))) 
  ]).then(([globalStats, excursionStats, monthlyStats, recentReservations]) => { 
    res.json({ 
      global: globalStats, 
      byExcursion: excursionStats, 
      monthly: monthlyStats, 
      recent: recentReservations 
    }); 
  }).catch(err => { 
    console.error('Erreur stats:', err); 
    res.status(500).json({ error: 'Erreur lors de la r‚cup‚ration des statistiques' }); 
  }); 
}); 

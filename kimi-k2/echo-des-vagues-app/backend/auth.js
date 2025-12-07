const crypto = require('crypto'); 
const users = new Map(); // Stockage temporaire des utilisateurs 
 
// Cl‚ secrŠte pour JWT (en production, utiliser une vraie bibliothŠque) 
const JWT_SECRET = 'echo-des-vagues-secret-key-2024'; 
 
// Cr‚er un utilisateur admin par d‚faut 
const createDefaultAdmin = () => { 
  const adminUser = { 
    id: 'admin-001', 
    username: 'admin', 
    password: 'admin123', // En production, hasher le mot de passe ! 
    email: 'admin@echodesvagues.fr', 
    role: 'admin', 
    createdAt: new Date().toISOString() 
  }; 
  users.set(adminUser.id, adminUser); 
  console.log('? Admin cr‚‚ - Username: admin, Password: admin123'); 
}; 
 
// Middleware d'authentification de base 
const authenticate = (req, res, next) => { 
  const authHeader = req.headers.authorization; 
  if (!authHeader) { 
    return res.status(401).json({ error: 'Authentification requise' }); 
  } 
 
  // Authentification basique (username:password en base64) 
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii'); 
  const [username, password] = credentials.split(':'); 
 
  // V‚rifier l'utilisateur 
  let user = null; 
  for (let [id, userData] of users) { 
      user = userData; 
      break; 
    } 
  } 
 
  if (!user) { 
    return res.status(401).json({ error: 'Identifiants invalides' }); 
  } 
 
  req.user = user; 
  next(); 
}; 
 
// V‚rifier si l'utilisateur est admin 
const requireAdmin = (req, res, next) => { 
  if (req.user.role !== 'admin') { 
    return res.status(403).json({ error: 'AccŠs admin requis' }); 
  } 
  next(); 
}; 
 
// Cr‚er un utilisateur 
const createUser = (username, password, email, role = 'user') => { 
  const id = 'user-' + Date.now(); 
  const user = { 
    id, 
    username, 
    password, // · hasher en production ! 
    email, 
    role, 
    createdAt: new Date().toISOString() 
  }; 
  users.set(id, user); 
  return user; 
}; 
 
// Obtenir tous les utilisateurs (admin seulement) 
const getAllUsers = () => { 
  return Array.from(users.values()); 
}; 
 
module.exports = { 
  createDefaultAdmin, 
  requireAdmin, 
  createUser, 
  getAllUsers 
}; 

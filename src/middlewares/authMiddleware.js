const jwt = require('jsonwebtoken');

function verificarAdmin(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = auth.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = { verificarAdmin };
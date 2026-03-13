const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("USUÁRIO AUTENTICADO:", decoded);

    req.user = decoded; // agora você tem o id do usuário

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = { verificarToken };
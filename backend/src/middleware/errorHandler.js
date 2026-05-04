// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Erros do Mongoose 

  // Campos obrigatórios faltando, enum inválido, etc.
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Dados inválidos', details: errors });
  }

  // ID de MongoDB mal formatado (ex: /exercises/abc)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Email duplicado — índice unique violado (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field} já está em uso` });
  }

  // Erros do JWT 
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado, faça login novamente' });
  }

  // Erros com status definido manualmente 
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Fallback 
  res.status(500).json({
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
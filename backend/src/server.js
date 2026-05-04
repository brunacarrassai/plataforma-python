require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Rotas
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/progress',  require('./routes/progress'));

// health check para saber se o servidor esta vivo
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamps: new Date().toISOString() });
});

// Error handler global
// deve vir DEPOIS de todas as rotas
app.use(errorHandler);

// Inicialização
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
});
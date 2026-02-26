// Server: inicializa aplicação
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const pontosRoutes = require('./routes/pontoApoioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/pontos', pontosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
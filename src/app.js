// Server: inicializa aplicação
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// 🔎 DEBUG DE AMBIENTE
console.log("====================================");
console.log("🚀 INICIANDO SERVIDOR");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔑 OPENCAGE_KEY existe?", !!process.env.OPENCAGE_KEY);
console.log("🔑 OPENCAGE_KEY valor:", process.env.OPENCAGE_KEY);
console.log("🗄 SUPABASE_URL existe?", !!process.env.SUPABASE_URL);
console.log("====================================");



const pontosRoutes = require('./routes/pontoApoioRoutes');

app.get('/test-geocode', async (req, res) => {
  try {
    const endereco = "Rua Sete Lagoas, 140, Santana, Ubá, MG, Brasil";

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(endereco)}&key=${process.env.OPENCAGE_KEY}&limit=1&countrycode=BR`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      status: response.status,
      results: data
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/pontos', pontosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
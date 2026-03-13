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


const authRoutes = require('./routes/authRoutes')
const pontosRoutes = require('./routes/pontoApoioRoutes');
const pedidosRoutes = require('./routes/pedidosEntregaRoutes')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Rotas
app.use('/auth', authRoutes);
app.use('/pontos', pontosRoutes);
app.use('/pedidos', pedidosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
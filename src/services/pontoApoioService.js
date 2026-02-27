const { supabase } = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const TIPOS_VALIDOS = ['doacao', 'abrigo', 'comida'];

// ------------------------
// Listar todos os pontos
// ------------------------
async function listar(tipo) {
  const tipoNormalizado = (tipo || 'doacao').toLowerCase().trim();

  let query = supabase
    .from('pontos_apoio')
    .select('*')
    .eq('ativo', true)
    .eq('tipo', tipoNormalizado);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data || [];
}

// ------------------------
// Criar um ponto
// ------------------------
async function criar(dados) {
  // Validação básica
  if (!dados.nome || !dados.endereco || !dados.numero || !dados.cidade || !dados.estado) {
    throw new Error('Nome, endereço, número, cidade e estado são obrigatórios');
  }

  // ✅ Validação de tipo
  if (!dados.tipo || !TIPOS_VALIDOS.includes(dados.tipo)) {
    throw new Error('Tipo inválido. Use: doacao, abrigo ou comida');
  }

  // ✅ Itens só para doação
  if (dados.tipo === 'doacao') {
    if (!Array.isArray(dados.itens_recebidos)) {
      dados.itens_recebidos = [];
    }
  } else {
    dados.itens_recebidos = null;
  }

  // Sempre ativo ao criar
  dados.ativo = true;

  // Monta endereço completo
  const enderecoCompleto = montarEnderecoCompleto(dados);

  // Pega coordenadas
  const coords = await pegarCoordenadas(enderecoCompleto);
  dados.latitude = coords.latitude ?? null;
  dados.longitude = coords.longitude ?? null;

  // Inserir no Supabase
  const { data, error } = await supabase
    .from('pontos_apoio')
    .insert([dados])
    .select();

  if (error) throw new Error(error.message);

  return data?.[0] ?? { message: 'Ponto criado com sucesso' };
}

// ------------------------
// Função que tenta Nominatim e OpenCage em paralelo
// ------------------------
async function pegarCoordenadas(endereco) {
  try {
    const [nominatim, opencage] = await Promise.allSettled([
      buscarNominatim(endereco),
      buscarOpenCage(endereco)
    ]);

    if (nominatim.status === 'fulfilled' && nominatim.value.latitude) {
      return nominatim.value;
    }

    if (opencage.status === 'fulfilled' && opencage.value.latitude) {
      return opencage.value;
    }

    return { latitude: null, longitude: null };
  } catch {
    return { latitude: null, longitude: null };
  }
}

// ------------------------
async function buscarNominatim(endereco) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ApoioUba/1.0' },
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return { latitude: null, longitude: null };
  } catch {
    return { latitude: null, longitude: null };
  }
}

// ------------------------
async function buscarOpenCage(endereco) {
  try {
    const key = process.env.OPENCAGE_KEY;
    if (!key) return { latitude: null, longitude: null };

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(endereco)}&key=${key}&countrycode=BR&limit=1&language=pt`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        latitude: data.results[0].geometry.lat,
        longitude: data.results[0].geometry.lng
      };
    }

    return { latitude: null, longitude: null };
  } catch {
    return { latitude: null, longitude: null };
  }
}

// ------------------------
function montarEnderecoCompleto(dados) {
  const partes = [
    dados.endereco,
    dados.numero,
    dados.bairro,
    dados.cidade,
    dados.estado,
    'Brasil'
  ];

  return partes.filter(Boolean).join(', ');
}

module.exports = { listar, criar };
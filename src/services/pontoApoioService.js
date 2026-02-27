const { supabase } = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// ------------------------
// Listar todos os pontos
// ------------------------
async function listar() {
  const { data, error } = await supabase.from('pontos_doacao').select('*');
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

  // Garantir array para itens recebidos
  if (!Array.isArray(dados.itens_recebidos)) dados.itens_recebidos = [];

  // Monta endereço completo
  const enderecoCompleto = montarEnderecoCompleto(dados);

  // Pega coordenadas de forma segura e rápida
  const coords = await pegarCoordenadas(enderecoCompleto);
  dados.latitude = coords.latitude ?? null;
  dados.longitude = coords.longitude ?? null;

  // Inserir no Supabase
  const { data, error } = await supabase.from('pontos_doacao').insert([dados]);
  if (error) throw new Error(error.message);

  // Retornar primeiro elemento ou uma mensagem
  return data?.[0] ?? { message: 'Ponto criado, mas nenhum dado retornado' };
}

// ------------------------
// Função que tenta Nominatim e OpenCage em paralelo
// ------------------------
async function pegarCoordenadas(endereco) {
  try {
    // Tenta as duas APIs em paralelo para reduzir tempo
    const [nominatim, opencage] = await Promise.allSettled([
      buscarNominatim(endereco),
      buscarOpenCage(endereco)
    ]);

    // Prioriza Nominatim se válido
    if (nominatim.status === 'fulfilled' && nominatim.value.latitude && nominatim.value.longitude) {
      return nominatim.value;
    }

    // Senão usa OpenCage
    if (opencage.status === 'fulfilled' && opencage.value.latitude && opencage.value.longitude) {
      return opencage.value;
    }

    // Nenhuma coordenada encontrada
    return { latitude: null, longitude: null };
  } catch (err) {
    console.error('Erro ao pegar coordenadas:', err.message);
    return { latitude: null, longitude: null };
  }
}

// ------------------------
// Busca Nominatim (OpenStreetMap)
// ------------------------
async function buscarNominatim(endereco) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ApoioUbá/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }

    return { latitude: null, longitude: null };
  } catch {
    return { latitude: null, longitude: null };
  }
}

// ------------------------
// Busca OpenCage
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
// Monta endereço completo
// ------------------------
function montarEnderecoCompleto(dados) {
  const partes = [dados.endereco, dados.numero, dados.bairro, dados.cidade, dados.estado, 'Brasil'];
  return partes.filter(Boolean).join(', ');
}

module.exports = { listar, criar };
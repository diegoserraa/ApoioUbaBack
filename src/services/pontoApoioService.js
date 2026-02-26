const { supabase } = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Listar todos os pontos
async function listar() {
  const { data, error } = await supabase.from('pontos_doacao').select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Criar um ponto
async function criar(dados) {
  if (!dados.nome || !dados.endereco || !dados.numero || !dados.cidade || !dados.estado) {
    throw new Error('Nome, endereço, número, cidade e estado são obrigatórios');
  }

  if (!Array.isArray(dados.itens_recebidos)) dados.itens_recebidos = [];

  const enderecoCompleto = montarEnderecoCompleto(dados);

  // Pega coordenadas
  const coords = await pegarCoordenadas(enderecoCompleto);
  dados.latitude = coords.latitude;
  dados.longitude = coords.longitude;

  const { data, error } = await supabase.from('pontos_doacao').insert([dados]);
  if (error) throw new Error(error.message);

  return data[0];
}

// Função que tenta Nominatim e, se não achar, OpenCage
async function pegarCoordenadas(endereco) {
  try {
    // 1️⃣ Tenta Nominatim
    let coords = await buscarNominatim(endereco);
    if (coords.latitude && coords.longitude) return coords;

    // 2️⃣ Se não achar, tenta OpenCage
    coords = await buscarOpenCage(endereco);
    return coords;

  } catch (err) {
    console.error('Erro ao pegar coordenadas:', err.message);
    return { latitude: null, longitude: null };
  }
}

async function buscarNominatim(endereco) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ApoioUbá/1.0' }, signal: controller.signal });
    clearTimeout(timeout);

    const data = await response.json();
    if (data.length > 0) return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    return { latitude: null, longitude: null };
  } catch {
    return { latitude: null, longitude: null };
  }
}

async function buscarOpenCage(endereco) {
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
}

// Monta endereço completo
function montarEnderecoCompleto(dados) {
  const partes = [dados.endereco, dados.numero, dados.bairro, dados.cidade, dados.estado, 'Brasil'];
  return partes.filter(Boolean).join(', ');
}

module.exports = { listar, criar };
// Service: lógica de negócios dos pontos de apoio
const { supabase } = require('../config/db'); // client Supabase
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // import dinâmico compatível

// Listar todos os pontos
async function listar() {
  const { data, error } = await supabase.from('pontos').select('*');
  if (error) throw new Error(error.message);
  return data;
}

// Criar um ponto
async function criar(dados) {
  // Validação básica
  if (!dados.nome || !dados.endereco || !dados.numero || !dados.cidade || !dados.estado) {
    throw new Error('Nome, endereço, número, cidade e estado são obrigatórios');
  }

  if (!Array.isArray(dados.itens_recebidos)) dados.itens_recebidos = [];

  // Monta endereço completo para geocoding
  const enderecoCompleto = montarEnderecoCompleto(dados);

  // Pega coordenadas (latitude/longitude)
  const coords = await pegarCoordenadas(enderecoCompleto);
  dados.latitude = coords.latitude;
  dados.longitude = coords.longitude;

  // Insere no Supabase
  const { data, error } = await supabase.from('pontos').insert([dados]);
  if (error) throw new Error(error.message);

  return data[0];
}

// Função para pegar latitude e longitude usando Nominatim
async function pegarCoordenadas(endereco) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s de timeout

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ApoioUbá/1.0' },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } else {
      return { latitude: null, longitude: null };
    }
  } catch (err) {
    console.error('Erro ao pegar coordenadas:', err.message);
    return { latitude: null, longitude: null };
  }
}

// Monta endereço completo
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

module.exports = {
  listar,
  criar
};
const { supabase } = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const jwt = require('jsonwebtoken');

const TIPOS_VALIDOS = ['doacao', 'abrigo', 'comida'];

// ------------------------
// Listar todos os pontos
// ------------------------
async function listar(tipo) {
  const tipoNormalizado = (tipo || 'doacao').toLowerCase().trim();

  console.log('📌 Listando pontos tipo:', tipoNormalizado);

  const { data, error } = await supabase
    .from('pontos_apoio')
    .select('*')
    .eq('ativo', true)
    .eq('tipo', tipoNormalizado);

  if (error) {
    console.error('❌ Erro ao listar:', error);
    throw new Error(error.message);
  }

  console.log('✅ Pontos encontrados:', data?.length || 0);

  return data || [];
}

// ------------------------
// Criar um ponto
// ------------------------
async function criar(dados) {
  process.stdout.write("🔥 SERVICE EXECUTADO 🔥\n");
  console.log('📥 Criando ponto:', dados.nome);

  if (!dados.nome || !dados.endereco || !dados.numero || !dados.cidade || !dados.estado) {
    throw new Error('Nome, endereço, número, cidade e estado são obrigatórios');
  }

  if (!dados.tipo || !TIPOS_VALIDOS.includes(dados.tipo)) {
    throw new Error('Tipo inválido. Use: doacao, abrigo ou comida');
  }

  if (dados.tipo === 'doacao') {
    if (!Array.isArray(dados.itens_recebidos)) {
      dados.itens_recebidos = [];
    }
  } else {
    dados.itens_recebidos = null;
  }

  dados.ativo = true;

  const enderecoCompleto = montarEnderecoCompleto(dados);
  console.log('📍 Endereço completo:', enderecoCompleto);

  const coords = await pegarCoordenadas(enderecoCompleto);

  console.log('🛰 Coordenadas retornadas:', coords);

  dados.latitude = coords.latitude ?? null;
  dados.longitude = coords.longitude ?? null;

  const { data, error } = await supabase
    .from('pontos_apoio')
    .insert([dados])
    .select();

  if (error) {
    console.error('❌ Erro ao inserir no Supabase:', error);
    throw new Error(error.message);
  }

  console.log('✅ Ponto criado com sucesso');

  return data?.[0] ?? { message: 'Ponto criado com sucesso' };
}

// ------------------------
async function pegarCoordenadas(endereco) {
  console.log('🌎 Iniciando busca de coordenadas...');
  console.log('🔑 OPENCAGE_KEY existe?', !!process.env.OPENCAGE_KEY);

  try {
    const [nominatim, opencage] = await Promise.allSettled([
      buscarNominatim(endereco),
      buscarOpenCage(endereco)
    ]);

    console.log('📡 Resultado Nominatim:', nominatim);
    console.log('📡 Resultado OpenCage:', opencage);

    if (nominatim.status === 'fulfilled' && nominatim.value?.latitude) {
      console.log('✅ Usando Nominatim');
      return nominatim.value;
    }

    if (opencage.status === 'fulfilled' && opencage.value?.latitude) {
      console.log('✅ Usando OpenCage');
      return opencage.value;
    }

    console.log('⚠ Nenhuma API retornou coordenadas válidas');

    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('🔥 ERRO GRAVE em pegarCoordenadas:', error);
    return { latitude: null, longitude: null };
  }
}

// ------------------------
async function buscarNominatim(endereco) {
  try {
    console.log('🔎 Tentando Nominatim...');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ApoioUba/1.0 (contato@apoio.com)'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('📡 Status Nominatim:', response.status);

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    console.log('⚠ Nominatim não encontrou resultados');

    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('❌ Erro Nominatim:', error.message);
    return { latitude: null, longitude: null };
  }
}

// ------------------------
async function buscarOpenCage(endereco) {
  try {
    console.log('🔎 Tentando OpenCage...');

    const key = process.env.OPENCAGE_KEY;

    if (!key) {
      console.error('❌ OPENCAGE_KEY não encontrada no ambiente');
      return { latitude: null, longitude: null };
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(endereco)}&key=${key}&countrycode=BR&limit=1&language=pt`;

    const response = await fetch(url);

    console.log('📡 Status OpenCage:', response.status);

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        latitude: data.results[0].geometry.lat,
        longitude: data.results[0].geometry.lng
      };
    }

    console.log('⚠ OpenCage não encontrou resultados');

    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('❌ Erro OpenCage:', error.message);
    return { latitude: null, longitude: null };
  }
}

// ------------------------
function montarEnderecoCompleto(dados) {
  return [
    dados.endereco,
    dados.numero,
    dados.bairro,
    dados.cidade,
    dados.estado,
    'Brasil'
  ]
    .filter(Boolean)
    .join(', ');
}


function loginAdmin(user, password) {
  if (
    user !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token };
}

module.exports = { listar, criar, loginAdmin};
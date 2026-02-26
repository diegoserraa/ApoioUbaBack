const pontosRepository = require('../repositories/pontoApoioRepository');

async function listar() {
  return await pontosRepository.listarPontos();
}

async function criar(dados) {
  if (!dados.nome || !dados.endereco || !dados.numero || !dados.cidade || !dados.estado) {
    throw new Error('Nome, endereço, número, cidade e estado são obrigatórios');
  }

  if (!Array.isArray(dados.itens_recebidos)) {
    dados.itens_recebidos = [];
  }

  const enderecoCompleto = montarEnderecoCompleto(dados);

  // Chama geocoding com endereço completo
  const coords = await pegarCoordenadas(enderecoCompleto);

  dados.latitude = coords.latitude;
  dados.longitude = coords.longitude;

  return await pontosRepository.criarPonto(dados);
}

// Função para pegar latitude e longitude a partir do endereço
async function pegarCoordenadas(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'MinhaApp/1.0' } });
  const data = await response.json();

  if (data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };
  } else {
    return { latitude: null, longitude: null };
  }
}

function montarEnderecoCompleto(dados) {
  const partes = [
    dados.endereco,       // Rua
    dados.numero,         // Número
    dados.bairro,         // Bairro
    dados.cidade,         // Cidade
    dados.estado,         // Estado
    'Brasil'              // País fixo
  ];

  // Remove campos vazios e junta tudo em uma string
  return partes.filter(Boolean).join(', ');
}

module.exports = {
  listar,
  criar
};


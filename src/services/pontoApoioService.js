const { supabase } = require('../config/db'); // client Supabase

async function listar() {
  const { data, error } = await supabase.from('pontos').select('*');
  if (error) throw new Error(error.message);
  return data;
}

async function criar(dados) {
  // validações
  if (!dados.nome || !dados.endereco || !dados.numero || !dados.cidade || !dados.estado) {
    throw new Error('Nome, endereço, número, cidade e estado são obrigatórios');
  }

  if (!Array.isArray(dados.itens_recebidos)) {
    dados.itens_recebidos = [];
  }

  const enderecoCompleto = montarEnderecoCompleto(dados);

  // geocoding
  const coords = await pegarCoordenadas(enderecoCompleto);
  dados.latitude = coords.latitude;
  dados.longitude = coords.longitude;

  // inserção no Supabase
  const { data, error } = await supabase.from('pontos').insert([dados]);
  if (error) throw new Error(error.message);

  return data[0];
}
module.exports = {
  listar,
  criar
};
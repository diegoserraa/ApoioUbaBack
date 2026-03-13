const { supabase } = require("../config/db");

// ------------------------
// Listar pontos
// ------------------------
async function listarComQuery(query) {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

// ------------------------
// Inserir ponto
// ------------------------
async function inserir(dados) {
  const { data, error } = await supabase
    .from("pontos_apoio")
    .insert([dados])
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] ?? { message: "Ponto criado com sucesso" };
}

// ------------------------
// Alterar status
// ------------------------
async function atualizarStatus(id, ativo) {
  const { data, error } = await supabase
    .from("pontos_apoio")
    .update({ ativo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

module.exports = {
  listarComQuery,
  inserir,
  atualizarStatus,
};
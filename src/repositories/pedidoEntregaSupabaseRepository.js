const { supabase } = require("../config/db");


// ------------------------
// Listar
// ------------------------
async function listarPedidos() {
  const { data, error } = await supabase
    .from("pedidos_entrega")
    .select("*")
    .order("prioridade", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data || [];
}

// ------------------------
// Criar
// ------------------------
async function inserirPedido(novoPedido) {
  const { data, error } = await supabase
    .from("pedidos_entrega")
    .insert([novoPedido])
    .select();

  if (error) throw error;

  return data?.[0];
}

// ------------------------
// Atualizar para entregue
// ------------------------
async function atualizarParaEntregue(id, dadosAtualizacao) {
  const { data, error } = await supabase
    .from("pedidos_entrega")
    .update(dadosAtualizacao)
    .eq("id", id)
    .select();

  if (error) throw error;

  return data?.[0];
}

module.exports = {
  listarPedidos,
  inserirPedido,
  atualizarParaEntregue,
};
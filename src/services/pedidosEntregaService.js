const userRepository = require('../repositories/pedidoEntregaSupabaseRepository');

// mapa de prioridades
const PRIORIDADES = {
  acamado: 1,
  deficiencia: 2,
  idoso: 3,
  mae_solo: 4,
  sem_transporte: 5,
  outro: 6,
};

// ------------------------
async function listar() {
  try {
    return await userRepository.listarPedidos();
  } catch (error) {
    console.error("❌ Erro ao listar pedidos:", error);
    throw new Error(error.message);
  }
}

// ------------------------
async function criar(dados) {
  const {
    nome,
    telefone,
    endereco,
    bairro,
    itens,
    justificativa_motivo,
    justificativa_obs,
  } = dados;

  if (
    !nome ||
    !telefone ||
    !endereco ||
    !bairro ||
    !justificativa_motivo ||
    !Array.isArray(itens) ||
    itens.length === 0
  ) {
    throw new Error("Todos os campos obrigatórios devem ser preenchidos");
  }

  const prioridade = PRIORIDADES[justificativa_motivo] || 6;

  const novoPedido = {
    nome,
    telefone,
    endereco,
    bairro,
    itens,
    justificativa_motivo,
    justificativa_obs: justificativa_obs || null,
    prioridade,
    status: "pendente",
  };

  try {
    const pedidoCriado = await userRepository.inserirPedido(novoPedido);
    return pedidoCriado;
  } catch (error) {
    console.error("❌ Erro ao inserir pedido:", error);
    throw new Error(error.message);
  }
}

// ------------------------
async function marcarComoEntregue(id, responsavel) {
  if (!id) {
    throw new Error("ID do pedido é obrigatório");
  }

  const dadosAtualizacao = {
    status: "entregue",
    entregue_em: new Date().toISOString(),
    responsavel: responsavel || null,
  };

  try {
    const pedidoAtualizado = await userRepository.atualizarParaEntregue(
      id,
      dadosAtualizacao
    );

    if (!pedidoAtualizado) {
      throw new Error("Pedido não encontrado");
    }

    return pedidoAtualizado;
  } catch (error) {
    console.error("❌ Erro ao atualizar pedido:", error);
    throw new Error(error.message);
  }
}

module.exports = {
  listar,
  criar,
  marcarComoEntregue,
};
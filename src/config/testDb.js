// src/services/testeSupabase.js
const { supabase } = require('./db');

async function test() {
  try {
    const { data, error } = await supabase.from('pontos_doacao').select('*');
    if (error) {
      console.error('Erro Supabase:', error);
    } else {
      console.log('Conexão OK! Dados:', data);
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

test();
const { supabase } = require('./db');

async function test() {
  try {
    const { data, error } = await supabase.from('pontos').select('*').limit(1);
    if (error) throw error;
    console.log('Conexão OK! Primeiro registro:', data[0]);
  } catch (err) {
    console.error('Erro de conexão detalhado:');
    console.error(err);
  }
}

test();
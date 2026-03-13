const { supabase } = require('../config/db');

async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;

  return data;
}

async function create(user) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

async function findAll() {
  const { data, error } = await supabase
    .from('users')
    .select('id, nome, email, ativo, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}

async function updateAtivo(id, ativo) {
  const { data, error } = await supabase
    .from('users')
    .update({ ativo })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

module.exports = {
  findByEmail,
  create,
  findAll,
  updateAtivo,
};
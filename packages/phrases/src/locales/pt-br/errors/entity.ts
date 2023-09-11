const entity = {
  invalid_input: 'Entrada inválida. A lista de valores não deve estar vazia.',
  create_failed: 'Falha ao criar {{name}}.',
  db_constraint_violated: 'Violação de restrição do banco de dados.',
  not_exists: 'O {{name}} não existe.',
  not_exists_with_id: 'O {{name}} com ID `{{id}}` não existe.',
  not_found: 'O recurso não existe.',
};

export default Object.freeze(entity);

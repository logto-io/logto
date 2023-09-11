const entity = {
  invalid_input: 'Entrada inválida. A lista de valores não deve estar vazia.',
  create_failed: 'Falha ao criar {{name}}.',
  db_constraint_violated: 'Restrição do banco de dados violada.',
  not_exists: '{{name}} não existe.',
  not_exists_with_id: '{{name}} com o ID `{{id}}` não existe.',
  not_found: 'O recurso não existe.',
};

export default Object.freeze(entity);

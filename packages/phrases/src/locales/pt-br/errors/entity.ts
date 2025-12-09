const entity = {
  invalid_input: 'Entrada inválida. A lista de valores não deve estar vazia.',
  value_too_long: 'O comprimento do valor é muito longo e excede o limite.',
  create_failed: 'Falha ao criar {{name}}.',
  db_constraint_violated: 'Violação de restrição do banco de dados.',
  not_exists: 'O {{name}} não existe.',
  not_exists_with_id: 'O {{name}} com ID `{{id}}` não existe.',
  not_found: 'O recurso não existe.',
  relation_foreign_key_not_found:
    'Não é possível encontrar uma ou mais chaves estrangeiras. Por favor, verifique a entrada e garanta que todas as entidades referenciadas existam.',
  unique_integrity_violation:
    'A entidade já existe. Por favor, verifique a entrada e tente novamente.',
};

export default Object.freeze(entity);

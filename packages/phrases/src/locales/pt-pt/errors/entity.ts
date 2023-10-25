const entity = {
  invalid_input: 'Entrada inválida. A lista de valores não deve estar vazia.',
  create_failed: 'Falha ao criar {{name}}.',
  db_constraint_violated: 'Restrição do banco de dados violada.',
  not_exists: '{{name}} não existe.',
  not_exists_with_id: '{{name}} com o ID `{{id}}` não existe.',
  not_found: 'O recurso não existe.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);

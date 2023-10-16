const entity = {
  invalid_input: 'Entrada inválida. A lista de valores não deve estar vazia.',
  create_failed: 'Falha ao criar {{name}}.',
  db_constraint_violated: 'Violação de restrição do banco de dados.',
  not_exists: 'O {{name}} não existe.',
  not_exists_with_id: 'O {{name}} com ID `{{id}}` não existe.',
  not_found: 'O recurso não existe.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  duplicate_value_of_unique_field: 'The value of the unique field `{{field}}` is duplicated.',
};

export default Object.freeze(entity);

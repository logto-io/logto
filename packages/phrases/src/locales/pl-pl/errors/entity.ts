const entity = {
  invalid_input: 'Nieprawidłowe dane. Lista wartości nie może być pusta.',
  create_failed: 'Nie udało się utworzyć {{name}}.',
  db_constraint_violated: 'Constraint naruszenie bazy danych.',
  not_exists: '{{name}} nie istnieje.',
  not_exists_with_id: '{{name}} o identyfikatorze `{{id}}` nie istnieje.',
  not_found: 'Zasób nie istnieje.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);

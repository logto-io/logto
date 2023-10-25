const entity = {
  invalid_input: 'Input non valido. La lista dei valori non deve essere vuota.',
  create_failed: 'Impossibile creare {{name}}.',
  db_constraint_violated: 'Vincolo del database violato.',
  not_exists: '{{name}} non esiste.',
  not_exists_with_id: '{{name}} con ID `{{id}}` non esiste.',
  not_found: 'La risorsa non esiste.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);

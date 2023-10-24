const entity = {
  invalid_input: 'Entrada no válida. La lista de valores no debe estar vacía.',
  create_failed: 'Fallo al crear {{name}}.',
  db_constraint_violated: 'Viólación de restricción de base de datos.',
  not_exists: 'El {{name}} no existe.',
  not_exists_with_id: 'El {{name}} con ID `{{id}}` no existe.',
  not_found: 'El recurso no existe.',
  /** UNTRANSLATED */
  relation_foreign_key_not_found:
    'Cannot find one or more foreign keys. Please check the input and ensure that all referenced entities exist.',
  /** UNTRANSLATED */
  unique_integrity_violation: 'The entity already exists. Please check the input and try again.',
};

export default Object.freeze(entity);

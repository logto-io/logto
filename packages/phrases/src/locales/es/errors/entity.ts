const entity = {
  invalid_input: 'Entrada no válida. La lista de valores no debe estar vacía.',
  create_failed: 'Fallo al crear {{name}}.',
  db_constraint_violated: 'Viólación de restricción de base de datos.',
  not_exists: 'El {{name}} no existe.',
  not_exists_with_id: 'El {{name}} con ID `{{id}}` no existe.',
  not_found: 'El recurso no existe.',
};

export default Object.freeze(entity);

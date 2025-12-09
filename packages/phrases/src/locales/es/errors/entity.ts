const entity = {
  invalid_input: 'Entrada no válida. La lista de valores no debe estar vacía.',
  value_too_long: 'La longitud del valor es demasiado larga y excede el límite.',
  create_failed: 'Fallo al crear {{name}}.',
  db_constraint_violated: 'Violación de restricción de base de datos.',
  not_exists: 'El {{name}} no existe.',
  not_exists_with_id: 'El {{name}} con ID `{{id}}` no existe.',
  not_found: 'El recurso no existe.',
  relation_foreign_key_not_found:
    'No se pueden encontrar una o más claves foráneas. Por favor, verifique la entrada y asegúrese de que todas las entidades referenciadas existan.',
  unique_integrity_violation:
    'La entidad ya existe. Por favor, verifique la entrada e intente\\lo de nuevo.',
};

export default Object.freeze(entity);

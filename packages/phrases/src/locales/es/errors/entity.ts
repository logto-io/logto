const entity = {
  invalid_input: 'Entrada no v\\u00E1lida. La lista de valores no debe estar vac\\u00EDa.',
  create_failed: 'Fallo al crear {{name}}.',
  db_constraint_violated: 'Vio\\u00E1laci\\u00F3n de restricci\\u00F3n de base de datos.',
  not_exists: 'El {{name}} no existe.',
  not_exists_with_id: 'El {{name}} con ID `{{id}}` no existe.',
  not_found: 'El recurso no existe.',
  relation_foreign_key_not_found:
    'No se pueden encontrar una o m\\u00E1s claves for\\u00E1neas. Por favor, verifique la entrada y aseg\\u00FArese de que todas las entidades referenciadas existan.',
  unique_integrity_violation:
    'La entidad ya existe. Por favor, verifique la entrada e int\\u00E9ntelo de nuevo.',
};

export default Object.freeze(entity);

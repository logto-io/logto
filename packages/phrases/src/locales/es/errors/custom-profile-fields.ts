const custom_profile_fields = {
  entity_not_exists_with_names: 'No se pueden encontrar entidades con los nombres dados: {{names}}',
  invalid_min_max_input: 'Entrada de mínimo y máximo no válida.',
  invalid_default_value: 'Valor por defecto no válido.',
  invalid_options: 'Opciones de campo no válidas.',
  invalid_regex_format: 'Formato de expresión regular no válido.',
  invalid_address_components: 'Componentes de dirección no válidos.',
  invalid_fullname_components: 'Componentes de nombre completo no válidos.',
  invalid_sub_component_type: 'Tipo de subcomponente no válido.',
  name_exists: 'Ya existe un campo con el nombre proporcionado.',
  conflicted_sie_order:
    'Valor de orden de campo en conflicto para la experiencia de inicio de sesión.',
  invalid_name:
    'Nombre de campo no válido, solo se permiten letras o números, distingue entre mayúsculas y minúsculas.',
  name_conflict_sign_in_identifier:
    'Nombre de campo no válido. Claves de identificador de inicio de sesión reservadas: {{name}}.',
  name_conflict_built_in_prop:
    'Nombre de campo no válido. Nombres de propiedades integradas del perfil de usuario reservados: {{name}}.',
  name_conflict_custom_data:
    'Nombre de campo no válido. Claves de datos personalizados reservadas: {{name}}.',
  name_required: 'El nombre del campo es obligatorio.',
};

export default Object.freeze(custom_profile_fields);

const custom_profile_fields = {
  entity_not_exists_with_names:
    'Não é possível encontrar entidades com os nomes fornecidos: {{names}}',
  invalid_min_max_input: 'Entrada mínima ou máxima inválida.',
  invalid_default_value: 'Valor predefinido inválido.',
  invalid_options: 'Opções de campo inválidas.',
  invalid_regex_format: 'Formato de regex inválido.',
  invalid_address_components: 'Componentes do endereço inválidos.',
  invalid_fullname_components: 'Componentes do nome completo inválidos.',
  invalid_sub_component_type: 'Tipo de subcomponente inválido.',
  name_exists: 'Já existe um campo com o nome fornecido.',
  conflicted_sie_order:
    'Valor de ordem do campo em conflito para a experiência de início de sessão.',
  invalid_name:
    'Nome de campo inválido, apenas letras ou números são permitidos, diferencia maiúsculas de minúsculas.',
  name_conflict_sign_in_identifier:
    'Nome de campo inválido. Chaves de identificador de início de sessão reservadas: {{name}}.',
  name_conflict_built_in_prop:
    'Nome de campo inválido. Nomes de propriedades integradas do perfil de utilizador reservados: {{name}}.',
  name_conflict_custom_data:
    'Nome de campo inválido. Chaves de dados personalizados reservadas: {{name}}.',
  name_required: 'O nome do campo é obrigatório.',
};

export default Object.freeze(custom_profile_fields);

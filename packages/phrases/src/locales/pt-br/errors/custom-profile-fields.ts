const custom_profile_fields = {
  entity_not_exists_with_names:
    'Não é possível encontrar entidades com os nomes fornecidos: {{names}}',
  invalid_min_max_input: 'Entrada mínima e máxima inválida.',
  invalid_default_value: 'Valor padrão inválido.',
  invalid_options: 'Opções de campo inválidas.',
  invalid_regex_format: 'Formato de regex inválido.',
  invalid_address_components: 'Componentes de endereço inválidos.',
  invalid_fullname_components: 'Componentes do nome completo inválidos.',
  invalid_sub_component_type: 'Tipo de subcomponente inválido.',
  name_exists: 'Já existe um campo com o nome fornecido.',
  conflicted_sie_order: 'Valor de ordem de campo em conflito para a Experiência de Login.',
  invalid_name:
    'Nome de campo inválido, apenas letras ou números são permitidos, diferenciação por maiúsculas e minúsculas.',
  name_conflict_sign_in_identifier:
    'Nome de campo inválido. Chaves de identificador de login reservadas: {{name}}.',
  name_conflict_built_in_prop:
    'Nome de campo inválido. Nomes de propriedades integradas do perfil do usuário reservados: {{name}}.',
  name_conflict_custom_data:
    'Nome de campo inválido. Chaves de dados personalizados reservadas: {{name}}.',
  name_required: 'O nome do campo é obrigatório.',
};

export default Object.freeze(custom_profile_fields);

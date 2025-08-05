const custom_profile_fields = {
  entity_not_exists_with_names:
    'Não é possível encontrar entidades com os nomes fornecidos: {{names}}',
  invalid_min_max_input: 'Entrada mínima ou máxima inválida.',
  invalid_options: 'Opções de campo inválidas.',
  invalid_regex_format: 'Formato de regex inválido.',
  invalid_address_parts: 'Partes do endereço inválidas.',
  invalid_fullname_parts: 'Partes do nome completo inválidas.',
  name_exists: 'Já existe um campo com o nome fornecido.',
  conflicted_sie_order:
    'Valor de ordem do campo em conflito para a experiência de início de sessão.',
  invalid_name:
    'Nome de campo inválido, apenas letras ou números são permitidos, diferencia maiúsculas de minúsculas.',
  name_conflict_sign_in_identifier:
    'Nome de campo inválido. "{{name}}" é uma chave reservada de identificador de início de sessão.',
  name_conflict_built_in_prop:
    'Nome de campo inválido. "{{name}}" é uma propriedade de perfil de utilizador integrada reservada.',
  name_conflict_custom_data:
    'Nome de campo inválido. "{{name}}" é uma chave reservada de dados personalizados.',
  name_required: 'O nome do campo é obrigatório.',
};

export default Object.freeze(custom_profile_fields);

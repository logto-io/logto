const custom_profile_fields = {
  table: {
    add_button: 'Adicionar campo de perfil',
    title: {
      field_label: 'Rótulo do campo',
      type: 'Tipo',
      user_data_key: 'Chave no perfil do utilizador',
    },
    placeholder: {
      title: 'Recolher perfil do utilizador',
      description:
        'Personalize campos para recolher mais informações do perfil do utilizador durante o registo.',
    },
  },
  type: {
    Text: 'Texto',
    Number: 'Número',
    Date: 'Data',
    Checkbox: 'Caixa de verificação (Booleano)',
    Select: 'Menu suspenso (Seleção única)',
    Url: 'URL',
    Regex: 'Expressão regular',
    Address: 'Morada (Composição)',
    Fullname: 'Nome completo (Composição)',
  },
  modal: {
    title: 'Adicionar campo de perfil',
    subtitle:
      'Personalize campos para recolher mais informações do perfil do utilizador durante o registo.',
    built_in_properties: 'Propriedades incorporadas do perfil do utilizador',
    custom_properties: 'Propriedades personalizadas',
    custom_data_field_name: 'Nome do campo de dados personalizado',
    custom_data_field_input_placeholder:
      'Introduza o nome do campo de dados personalizado, por exemplo, `meuCampoFavorito`',
    custom_field: {
      title: 'Campo de dados personalizado',
      description:
        'Quaisquer propriedades adicionais do utilizador que possa definir para atender aos requisitos únicos da sua aplicação.',
    },
    type_required: 'Por favor, selecione um tipo de propriedade',
    create_button: 'Criar campo de perfil',
  },
  details: {
    page_title: 'Detalhes do campo de perfil',
    back_to_sie: 'Voltar para a experiência de início de sessão',
    enter_field_name: 'Introduza o nome do campo de perfil',
    delete_description:
      'Esta ação não pode ser desfeita. Tem a certeza de que deseja eliminar este campo de perfil?',
    field_deleted: 'O campo de perfil {{name}} foi eliminado com sucesso.',
    key: 'Chave de dados do utilizador',
    field_name: 'Nome do campo',
    field_type: 'Tipo de campo',
    settings: 'Definições',
    settings_description:
      'Personalize campos para recolher mais informações do perfil do utilizador durante o registo.',
    address_format: 'Formato da morada',
    single_line_address: 'Morada de linha única',
    multi_line_address:
      'Morada de múltiplas linhas (por exemplo, Rua, Cidade, Estado, Código Postal, País)',
    composition_parts: 'Partes da composição',
    composition_parts_tip: 'Selecione as partes para compor o campo complexo.',
    label: 'Rótulo de exibição',
    label_placeholder: 'Rótulo',
    label_tip:
      'Precisa de localização? Adicione idiomas em <a>Experiência de início de sessão > Conteúdo</a>',
    placeholder: 'Marcador de posição de exibição',
    placeholder_placeholder: 'Marcador de posição',
    description: 'Descrição de exibição',
    description_placeholder: 'Descrição',
    options: 'Opções',
    options_tip:
      'Introduza cada opção numa nova linha. Use ponto e vírgula para separar chave e valor, por exemplo, `chave:valor`',
    options_placeholder: 'valor1:rótulo1\nvalor2:rótulo2\nvalor3:rótulo3',
    regex: 'Expressão regular',
    regex_tip: 'Defina uma expressão regular para validar a entrada.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato da data',
    date_format_us: 'Estados Unidos (MM/dd/yyyy)',
    date_format_uk: 'Reino Unido e Europa (dd/MM/yyyy)',
    date_format_iso: 'Padrão internacional (yyyy-MM-dd)',
    custom_date_format: 'Formato de data personalizado',
    custom_date_format_placeholder:
      'Introduza o formato de data personalizado. Por exemplo, "MM-dd-yyyy"',
    custom_date_format_tip:
      'Consulte a documentação <a>date-fns</a> para tokens de formatação válidos.',
    input_length: 'Comprimento da entrada',
    value_range: 'Intervalo de valores',
    min: 'Mínimo',
    max: 'Máximo',
    required: 'Obrigatório',
    required_description:
      'Quando ativado, este campo deve ser preenchido pelos utilizadores. Quando desativado, este campo é opcional.',
  },
};

export default Object.freeze(custom_profile_fields);

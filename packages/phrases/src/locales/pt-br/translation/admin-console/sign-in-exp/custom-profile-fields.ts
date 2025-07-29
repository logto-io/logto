const custom_profile_fields = {
  table: {
    add_button: 'Adicionar campo de perfil',
    title: {
      field_label: 'Rótulo do campo',
      type: 'Tipo',
      user_data_key: 'Chave no perfil do usuário',
    },
    placeholder: {
      title: 'Coletar perfil do usuário',
      description:
        'Personalize campos para coletar mais informações do perfil do usuário durante o cadastro.',
    },
  },
  type: {
    Text: 'Texto',
    Number: 'Número',
    Date: 'Data',
    Checkbox: 'Caixa de seleção (Booleano)',
    Select: 'Menu suspenso (Seleção única)',
    Url: 'URL',
    Regex: 'Expressão regular',
    Address: 'Endereço (Composição)',
    Fullname: 'Nome completo (Composição)',
  },
  modal: {
    title: 'Adicionar campo de perfil',
    subtitle:
      'Personalize campos para coletar mais informações do perfil do usuário durante o cadastro.',
    built_in_properties: 'Propriedades internas do perfil do usuário',
    custom_properties: 'Propriedades personalizadas',
    custom_data_field_name: 'Nome do campo de dados personalizado',
    custom_data_field_input_placeholder:
      'Digite o nome do campo de dados personalizado, por exemplo, `meuCampoFavorito`',
    custom_field: {
      title: 'Campo de dados personalizado',
      description:
        'Quaisquer propriedades adicionais do usuário que você pode definir para atender aos requisitos exclusivos do seu aplicativo.',
    },
    type_required: 'Selecione um tipo de propriedade',
    create_button: 'Criar campo de perfil',
  },
  details: {
    page_title: 'Detalhes do campo de perfil',
    back_to_sie: 'Voltar para experiência de login',
    enter_field_name: 'Digite o nome do campo de perfil',
    delete_description:
      'Esta ação não pode ser desfeita. Tem certeza de que deseja excluir este campo de perfil?',
    field_deleted: 'O campo de perfil {{name}} foi excluído com sucesso.',
    key: 'Chave de dados do usuário',
    field_name: 'Nome do campo',
    field_type: 'Tipo de campo',
    settings: 'Configurações',
    settings_description:
      'Personalize campos para coletar mais informações do perfil do usuário durante o cadastro.',
    address_format: 'Formato de endereço',
    single_line_address: 'Endereço em linha única',
    multi_line_address: 'Endereço em múltiplas linhas (Ex.: Rua, Cidade, Estado, CEP, País)',
    composition_parts: 'Partes da composição',
    composition_parts_tip: 'Selecione as partes para compor o campo complexo.',
    label: 'Rótulo de exibição',
    label_placeholder: 'Rótulo',
    label_tip: 'Precisa de localização? Adicione idiomas em <a>Experiência de login > Conteúdo</a>',
    description: 'Descrição de exibição',
    description_placeholder: 'Descrição',
    options: 'Opções',
    options_tip:
      'Digite cada opção em uma nova linha. Use ponto e vírgula para separar chave e valor, por exemplo, `chave:valor`',
    options_placeholder: 'valor1:rótulo1\nvalor2:rótulo2\nvalor3:rótulo3',
    regex: 'Expressão regular',
    regex_tip: 'Defina uma expressão regular para validar a entrada.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato de data',
    date_format_us: 'Estados Unidos (MM/dd/aaaa)',
    date_format_uk: 'Reino Unido e Europa (dd/MM/aaaa)',
    date_format_iso: 'Padrão internacional (aaaa-MM-dd)',
    custom_date_format: 'Formato de data personalizado',
    custom_date_format_placeholder: 'Digite o formato de data personalizado. Ex.: "MM-dd-aaaa"',
    custom_date_format_tip:
      'Consulte a documentação do <a>date-fns</a> para tokens de formatação válidos.',
    input_length: 'Comprimento da entrada',
    value_range: 'Intervalo de valores',
    min: 'Mínimo',
    max: 'Máximo',
    required: 'Obrigatório',
    required_description:
      'Quando ativado, este campo deve ser preenchido pelos usuários. Quando desativado, este campo é opcional.',
  },
};

export default Object.freeze(custom_profile_fields);

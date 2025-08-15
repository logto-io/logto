const custom_profile_fields = {
  table: {
    add_button: 'Adicionar campo de perfil',
    title: {
      field_label: 'Rótulo do campo',
      type: 'Tipo',
      user_data_key: 'Chave de dados do utilizador',
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
    built_in_properties: 'Dados básicos do utilizador',
    custom_properties: 'Dados personalizados do utilizador',
    custom_data_field_name: 'Chave de dados do utilizador',
    custom_data_field_input_placeholder:
      'Introduza a chave de dados do utilizador, por exemplo, `myFavoriteFieldName`',
    custom_field: {
      title: 'Dados personalizados',
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
    components: 'Componentes',
    components_tip: 'Selecione os componentes para compor o campo complexo.',
    label: 'Rótulo do campo',
    label_placeholder: 'Rótulo',
    label_tip:
      'Precisa de localização? Adicione idiomas em <a>Experiência de início de sessão > Conteúdo</a>',
    label_tooltip:
      'Rótulo flutuante que identifica a finalidade do campo. Surge dentro do input e move-se acima quando tem foco ou valor.',
    placeholder: 'Marcador de posição do campo',
    placeholder_placeholder: 'Marcador de posição',
    placeholder_tooltip:
      'Exemplo inline ou dica de formato mostrado dentro do campo. Normalmente aparece após o rótulo flutuar e deve ser curto (ex.: DD/MM/AAAA).',
    description: 'Descrição do campo',
    description_placeholder: 'Descrição',
    description_tooltip:
      'Texto de apoio exibido abaixo do campo. Use-o para instruções mais longas ou notas de acessibilidade.',
    options: 'Opções',
    options_tip:
      'Introduza cada opção numa nova linha. Formato: value:label (ex.: red:Vermelho). Pode também introduzir apenas value; se não for fornecido label, o próprio value será usado como rótulo.',
    options_placeholder: 'valor1:rótulo1\nvalor2:rótulo2\nvalor3:rótulo3',
    regex: 'Expressão regular',
    regex_tip: 'Defina uma expressão regular para validar a entrada.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato da data',
    date_format_us: 'MM/dd/yyyy (por exemplo, Estados Unidos)',
    date_format_uk: 'dd/MM/yyyy (por exemplo, Reino Unido e Europa)',
    date_format_iso: 'yyyy-MM-dd (Padrão internacional)',
    custom_date_format: 'Formato de data personalizado',
    custom_date_format_placeholder:
      'Introduza o formato de data personalizado. Por exemplo, "MM-dd-yyyy"',
    custom_date_format_tip:
      'Consulte a documentação <a>date-fns</a> para tokens de formatação válidos.',
    input_length: 'Comprimento da entrada',
    value_range: 'Intervalo de valores',
    min: 'Mínimo',
    max: 'Máximo',
    default_value: 'Valor predefinido',
    checkbox_checked: 'Marcado (True)',
    checkbox_unchecked: 'Desmarcado (False)',
    required: 'Obrigatório',
    required_description:
      'Quando ativado, este campo deve ser preenchido pelos utilizadores. Quando desativado, este campo é opcional.',
  },
};

export default Object.freeze(custom_profile_fields);

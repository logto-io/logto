const custom_profile_fields = {
  table: {
    add_button: 'Adicionar campo de perfil',
    title: {
      field_label: 'Rótulo do campo',
      type: 'Tipo',
      user_data_key: 'Chave de dados do usuário',
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
    built_in_properties: 'Dados básicos do usuário',
    custom_properties: 'Dados personalizados do usuário',
    custom_data_field_name: 'Chave de dados do usuário',
    custom_data_field_input_placeholder:
      'Digite a chave de dados do usuário, por exemplo, `myFavoriteFieldName`',
    custom_field: {
      title: 'Dados personalizados',
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
    components: 'Componentes',
    components_tip: 'Selecione os componentes para compor o campo complexo.',
    label: 'Rótulo do campo',
    label_placeholder: 'Rótulo',
    label_tip: 'Precisa de localização? Adicione idiomas em <a>Experiência de login > Conteúdo</a>',
    label_tooltip:
      'Rótulo flutuante que identifica o propósito do campo. Aparece dentro do input e se move acima quando tem foco ou valor.',
    placeholder: 'Placeholder do campo',
    placeholder_placeholder: 'Placeholder',
    placeholder_tooltip:
      'Exemplo inline ou dica de formato dentro do campo. Normalmente aparece após o rótulo flutuar e deve ser curto (ex.: DD/MM/AAAA).',
    description: 'Descrição do campo',
    description_placeholder: 'Descrição',
    description_tooltip:
      'Texto de apoio exibido abaixo do campo. Use para instruções mais longas ou notas de acessibilidade.',
    options: 'Opções',
    options_tip:
      'Digite cada opção em uma nova linha. Formato: value:label (ex.: red:Red). Você também pode informar apenas value; se nenhum label for fornecido, o próprio value será exibido como rótulo.',
    options_placeholder: 'valor1:rótulo1\nvalor2:rótulo2\nvalor3:rótulo3',
    regex: 'Expressão regular',
    regex_tip: 'Defina uma expressão regular para validar a entrada.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato de data',
    date_format_us: 'MM/dd/yyyy (ex. Estados Unidos)',
    date_format_uk: 'dd/MM/yyyy (ex. Reino Unido e Europa)',
    date_format_iso: 'yyyy-MM-dd (Padrão internacional)',
    custom_date_format: 'Formato de data personalizado',
    custom_date_format_placeholder: 'Digite o formato de data personalizado. Ex.: "MM-dd-yyyy"',
    custom_date_format_tip:
      'Consulte a documentação do <a>date-fns</a> para tokens de formatação válidos.',
    input_length: 'Comprimento da entrada',
    value_range: 'Intervalo de valores',
    min: 'Mínimo',
    max: 'Máximo',
    default_value: 'Valor padrão',
    checkbox_checked: 'Marcado (True)',
    checkbox_unchecked: 'Desmarcado (False)',
    required: 'Obrigatório',
    required_description:
      'Quando ativado, este campo deve ser preenchido pelos usuários. Quando desativado, este campo é opcional.',
  },
};

export default Object.freeze(custom_profile_fields);

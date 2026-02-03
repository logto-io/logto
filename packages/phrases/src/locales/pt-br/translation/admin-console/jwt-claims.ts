const jwt_claims = {
  title: 'JWT Personalizado',
  description:
    'Configure reivindicações personalizadas no JWT para incluir no token de acesso. Essas reivindicações podem ser usadas para passar informações adicionais para sua aplicação.',
  user_jwt: {
    card_title: 'Para usuário',
    card_field: 'Token de acesso do usuário',
    card_description: 'Adicione dados específicos do usuário durante a emissão do token de acesso.',
    for: 'para usuário',
    custom_data_in_id_token: {
      title: 'Adicionar dados personalizados do usuário ao token de ID',
      tip: 'O token de ID é a afirmação de identidade que o cliente recebe após o login para provar quem é o usuário. É destinado ao cliente, contém declarações de identidade do usuário para exibição ou criação de sessão.',
      description:
        'Ative para incluir seus <a>dados personalizados do usuário</a> no token de ID, permitindo que os clientes acessem esses detalhes de identidade imediatamente sem chamadas de perfil adicionais.',
    },
  },
  machine_to_machine_jwt: {
    card_title: 'Para M2M',
    card_field: 'Token de máquina para máquina',
    card_description: 'Adicione dados extras durante a emissão do token de máquina para máquina.',
    for: 'para M2M',
  },
  code_editor_title: 'Personalizar as reivindicações {{token}}',
  custom_jwt_create_button: 'Adicionar reivindicações personalizadas',
  custom_jwt_item: 'Reivindicações personalizadas {{for}}',
  delete_modal_title: 'Excluir reivindicações personalizadas',
  delete_modal_content: 'Tem certeza de que deseja excluir as reivindicações personalizadas?',
  clear: 'Limpar',
  cleared: 'Limpado',
  restore: 'Restaurar padrões',
  restored: 'Restaurado',
  data_source_tab: 'Fonte de dados',
  test_tab: 'Contexto de teste',
  jwt_claims_description:
    'As reivindicações padrão são automaticamente incluídas no JWT e não podem ser substituídas.',
  user_data: {
    title: 'Dados do usuário',
    subtitle:
      'Use o parâmetro de entrada `context.user` para fornecer informações vitais do usuário.',
  },
  grant_data: {
    title: 'Dados da concessão',
    subtitle:
      'Use o parâmetro de entrada `context.grant` para fornecer informações vitais da concessão, disponível apenas para troca de token.',
  },
  interaction_data: {
    title: 'Contexto de interação do usuário',
    subtitle:
      'Use o parâmetro `context.interaction` para acessar os detalhes da interação do usuário na sessão de autenticação atual, incluindo `interactionEvent`, `userId` e `verificationRecords`.',
  },
  token_data: {
    title: 'Dados do token',
    subtitle: 'Use o parâmetro de entrada `token` para a carga útil do token de acesso atual. ',
  },
  api_context: {
    title: 'Contexto da API: controle de acesso',
    subtitle: 'Use o método `api.denyAccess` para rejeitar a solicitação de token.',
  },
  fetch_external_data: {
    title: 'Buscar dados externos',
    subtitle: 'Incorpore dados de suas APIs externas diretamente nas reivindicações.',
    description:
      'Use a função `fetch` para chamar suas APIs externas e incluir os dados em suas reivindicações personalizadas. Exemplo: ',
  },
  environment_variables: {
    title: 'Definir variáveis de ambiente',
    subtitle: 'Use variáveis de ambiente para armazenar informações confidenciais.',
    input_field_title: 'Adicionar variáveis de ambiente',
    sample_code:
      'Acessando variáveis de ambiente no manipulador de reivindicações JWT personalizado. Exemplo: ',
  },
  jwt_claims_hint:
    'Limite as reivindicações personalizadas a menos de 50KB. As reivindicações padrão do JWT são incluídas automaticamente no token e não podem ser substituídas.',
  tester: {
    subtitle: 'Ajuste o token simulado e os dados do usuário para testar.',
    run_button: 'Executar teste',
    result_title: 'Resultado do teste',
  },
  form_error: {
    invalid_json: 'Formato JSON inválido',
  },
};

export default Object.freeze(jwt_claims);

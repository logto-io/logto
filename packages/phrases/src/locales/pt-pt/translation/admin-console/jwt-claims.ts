const jwt_claims = {
  title: 'JWT Personalizado',
  description:
    'Personalize o token de acesso ou token de ID, fornecendo informações adicionais à sua aplicação.',
  access_token: {
    card_title: 'Token de acesso',
    card_description:
      'O token de acesso é a credencial usada pelas APIs para autorizar pedidos, contendo apenas as reivindicações necessárias para decisões de acesso.',
  },
  user_jwt: {
    card_field: 'Token de acesso do utilizador',
    card_description:
      'Adicione dados específicos do utilizador durante a emissão do token de acesso.',
    for: 'para utilizador',
  },
  machine_to_machine_jwt: {
    card_field: 'Token de acesso de máquina a máquina',
    card_description: 'Adicione dados extras durante a emissão do token de máquina a máquina.',
    for: 'para M2M',
  },
  id_token: {
    card_title: 'Token de ID',
    card_description:
      'O token de ID é uma afirmação de identidade recebida após o início de sessão, contendo reivindicações de identidade do utilizador para o cliente usar para apresentação ou criação de sessão.',
    card_field: 'Token de ID do utilizador',
    card_field_description:
      "As reivindicações 'sub', 'email', 'phone', 'profile' e 'address' estão sempre disponíveis. Outras reivindicações devem ser habilitadas aqui primeiro. Em todos os casos, a sua aplicação deve solicitar os scopes correspondentes durante a integração para recebê-las.",
  },
  code_editor_title: 'Personalizar as reivindicações {{token}}',
  custom_jwt_create_button: 'Adicionar reivindicações personalizadas',
  custom_jwt_item: 'Reivindicações personalizadas {{for}}',
  delete_modal_title: 'Eliminar reivindicações personalizadas',
  delete_modal_content: 'Tens a certeza de que queres eliminar as reivindicações personalizadas?',
  clear: 'Limpar',
  cleared: 'Limpo',
  restore: 'Restaurar predefinições',
  restored: 'Restaurado',
  data_source_tab: 'Fonte de dados',
  test_tab: 'Contexto de teste',
  jwt_claims_description:
    'As reivindicações predefinidas são automaticamente incluídas no JWT e não podem ser substituídas.',
  user_data: {
    title: 'Dados do utilizador',
    subtitle:
      'Utilize o parâmetro de entrada `context.user` para fornecer informações vitais do utilizador.',
  },
  grant_data: {
    title: 'Dados da concessão',
    subtitle:
      'Utilize o parâmetro de entrada `context.grant` para fornecer informações vitais da concessão, disponíveis apenas para troca de token.',
  },
  interaction_data: {
    title: 'Contexto de interação do utilizador',
    subtitle:
      'Use o parâmetro `context.interaction` para aceder aos detalhes da interação do utilizador para a sessão de autenticação atual, incluindo `interactionEvent`, `userId` e `verificationRecords`.',
  },
  token_data: {
    title: 'Dados do token',
    subtitle: 'Utilize o parâmetro de entrada `token` para a carga util atual do token de acesso.',
  },
  api_context: {
    title: 'Contexto da API: controlo de acesso',
    subtitle: 'Use o método `api.denyAccess` para rejeitar o pedido de token.',
  },
  fetch_external_data: {
    title: 'Obter dados externos',
    subtitle: 'Incorpore dados das suas APIs externas diretamente nas reivindicações.',
    description:
      'Utilize a função `fetch` para chamar as suas APIs externas e incluir os dados nas suas reivindicações personalizadas. Exemplo: ',
  },
  environment_variables: {
    title: 'Definir variáveis de ambiente',
    subtitle: 'Utilize variáveis de ambiente para armazenar informações confidenciais.',
    input_field_title: 'Adicionar variáveis de ambiente',
    sample_code:
      'Acedendo a variáveis de ambiente no manipulador de reivindicações JWT personalizadas. Exemplo: ',
  },
  jwt_claims_hint:
    'Limite as reivindicações personalizadas a menos de 50KB. As reivindicações JWT predefinidas são automaticamente incluídas no token e não podem ser substituídas.',
  tester: {
    subtitle: 'Ajustar token falso e dados do utilizador para teste.',
    run_button: 'Executar teste',
    result_title: 'Resultado do teste',
  },
  form_error: {
    invalid_json: 'Formato JSON inválido',
  },
};

export default Object.freeze(jwt_claims);

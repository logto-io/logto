const jwt_claims = {
  title: 'JWT Personalizado',
  description:
    'Configure reivindicações JWT personalizadas a incluir no token de acesso. Estas reivindicações podem ser usadas para passar informações adicionais para a sua aplicação.',
  user_jwt: {
    card_title: 'Para utilizador',
    card_field: 'Token de acesso do utilizador',
    card_description:
      'Adicione dados específicos do utilizador durante a emissão do token de acesso.',
    for: 'para utilizador',
  },
  machine_to_machine_jwt: {
    card_title: 'Para M2M',
    card_field: 'Token de máquina a máquina',
    card_description: 'Adicione dados extras durante a emissão do token de máquina a máquina.',
    for: 'para M2M',
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
  token_data: {
    title: 'Dados do token',
    subtitle: 'Utilize o parâmetro de entrada `token` para a carga util atual do token de acesso.',
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

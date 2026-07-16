const inline_hooks = {
  page_title: 'Hooks inline',
  title: 'Hooks inline',
  subtitle:
    'Execute código personalizado em pontos específicos do fluxo de autenticação para estender o comportamento do Logto.',
  details_page_title: '{{name}}',
  status: {
    not_configured: 'Não configurado',
    configured: 'Configurado',
    enabled: 'Ativado',
    disabled: 'Desativado',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Após a verificação do primeiro fator',
      description:
        'Execute lógica personalizada após a verificação do primeiro fator de autenticação e antes de o login continuar.',
    },
    post_sign_in: {
      name: 'Após o login',
      description: 'Execute lógica personalizada após um usuário entrar com sucesso.',
    },
  },
  data_source_tab: 'Fonte de dados',
  test_tab: 'Contexto de teste',
  settings_tab: 'Configurações',
  event_data: {
    title: 'Payload do evento',
    subtitle: 'Use o parâmetro de entrada `event` para os dados do evento de autenticação.',
  },
  result_data: {
    title: 'Resultado do hook',
    subtitle: 'Retorne um objeto de resultado que o Logto entenda para este tipo de hook.',
  },
  environment_variables: {
    title: 'Definir variáveis de ambiente',
    subtitle: 'Use variáveis de ambiente para armazenar informações sensíveis.',
    input_field_title: 'Adicionar variáveis de ambiente',
    sample_code: 'Acessando variáveis de ambiente no manipulador do hook inline. Exemplo:',
  },
  fetch_external_data: {
    title: 'Buscar dados externos',
    subtitle: 'Chame APIs externas a partir do script do hook.',
    description:
      'Use a função `fetch` para chamar suas APIs externas e incluir os dados no resultado do hook. Exemplo:',
  },
  settings: {
    title: 'Configurações',
    subtitle: 'Controle se o hook está ativo e como os erros de tempo de execução são tratados.',
    enabled: {
      title: 'Ativar hook',
      description: 'Execute este script quando o evento de autenticação for acionado.',
    },
    on_execution_error: {
      title: 'Em caso de erro no script',
      description:
        'Escolha como o Logto deve se comportar quando o script falhar em tempo de execução.',
      block: 'Bloquear o fluxo de autenticação',
      allow: 'Permitir que o fluxo de autenticação continue',
      post_first_factor_description:
        'Quando este script falha, o Logto sempre rejeita credenciais inválidas para que a verificação de senha não possa ser contornada.',
    },
  },
  test_context: {
    subtitle: 'Ajuste o payload de evento simulado usado ao executar testes.',
    input_field_title: 'JSON de exemplo do evento',
  },
  script: {
    title: 'Script',
    restore: 'Restaurar padrões',
    restored: 'Restaurado',
  },
  tester: {
    run_button: 'Executar teste',
    result_title: 'Resultado do teste',
  },
  form_error: {
    invalid_json: 'Formato JSON inválido',
  },
  security_warning: {
    title: 'Aviso de segurança',
    description:
      'Usuários provisionados por este hook ignoram proteções exclusivas do registro, incluindo blocklist de e-mail, domínio apenas SSO, modo de cadastro desativado e verificações de perfil obrigatório no registro. Gravações de perfil e senha de usuários existentes também ocorrem antes da conclusão da MFA.',
  },
  delete_modal_title: 'Excluir hook inline',
  delete_modal_content:
    'Tem certeza de que deseja excluir este hook inline? O fluxo de autenticação não executará mais este script.',
  deleted: 'Hook inline excluído',
  created: 'Hook inline criado',
  saved: 'Hook inline salvo',
};

export default Object.freeze(inline_hooks);

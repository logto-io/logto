const inline_hooks = {
  page_title: 'Hooks inline',
  title: 'Hooks inline',
  subtitle:
    'Execute código personalizado em pontos específicos do fluxo de autenticação para expandir o comportamento do Logto.',
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
        'Execute lógica personalizada após a verificação do primeiro fator de autenticação e antes de o início de sessão continuar.',
    },
    post_sign_in: {
      name: 'Após o início de sessão',
      description: 'Execute lógica personalizada após um utilizador iniciar sessão com sucesso.',
    },
  },
  data_source_tab: 'Fonte de dados',
  test_tab: 'Contexto de teste',
  settings_tab: 'Definições',
  event_data: {
    title: 'Payload do evento',
    subtitle: 'Utilize o parâmetro de entrada `event` para os dados do evento de autenticação.',
  },
  result_data: {
    title: 'Resultado do hook',
    subtitle: 'Devolva um objeto de resultado que o Logto compreenda para este tipo de hook.',
  },
  environment_variables: {
    title: 'Definir variáveis de ambiente',
    subtitle: 'Utilize variáveis de ambiente para armazenar informações sensíveis.',
    input_field_title: 'Adicionar variáveis de ambiente',
    sample_code: 'Aceder a variáveis de ambiente no processador do hook inline. Exemplo:',
  },
  fetch_external_data: {
    title: 'Obter dados externos',
    subtitle: 'Chame APIs externas a partir do script do hook.',
    description:
      'Utilize a função `fetch` para chamar as suas APIs externas e incluir os dados no resultado do hook. Exemplo:',
  },
  settings: {
    title: 'Definições',
    subtitle: 'Controle se o hook está ativo e como os erros de execução são tratados.',
    enabled: {
      title: 'Ativar hook',
      description: 'Execute este script quando o evento de autenticação for acionado.',
    },
    on_execution_error: {
      title: 'Em caso de erro no script',
      description:
        'Escolha como o Logto se deve comportar quando o script falhar em tempo de execução.',
      block: 'Bloquear o fluxo de autenticação',
      allow: 'Permitir que o fluxo de autenticação continue',
      post_first_factor_description:
        'Quando este script falha, o Logto rejeita sempre credenciais inválidas para que a verificação da palavra-passe não possa ser contornada.',
    },
  },
  test_context: {
    subtitle: 'Ajuste o payload de evento simulado utilizado ao executar testes.',
    input_field_title: 'JSON de exemplo do evento',
  },
  script: {
    title: 'Script',
    restore: 'Restaurar predefinições',
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
      'Os utilizadores provisionados por este hook contornam proteções exclusivas do registo, incluindo a blocklist de e-mail, o domínio apenas SSO, o modo de registo desativado e as verificações de perfil obrigatório no registo. As escritas de perfil e palavra-passe de utilizadores existentes também ocorrem antes da conclusão da MFA.',
  },
  delete_modal_title: 'Eliminar hook inline',
  delete_modal_content:
    'Tem a certeza de que pretende eliminar este hook inline? O fluxo de autenticação deixará de executar este script.',
  deleted: 'Hook inline eliminado',
  created: 'Hook inline criado',
  saved: 'Hook inline guardado',
};

export default Object.freeze(inline_hooks);

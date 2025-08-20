const sign_up_and_sign_in = {
  identifiers_email: 'Endereço de email',
  identifiers_phone: 'Número de telefone',
  identifiers_username: 'Nome de utilizador',
  identifiers_email_or_sms: 'Endereço de email ou número de telefone',
  identifiers_none: 'Não aplicável',
  and: 'e',
  or: 'ou',
  sign_up: {
    title: 'REGISTO',
    sign_up_identifier: 'Identificador de registo',
    identifier_description:
      'Todos os identificadores de registo selecionados são necessários ao criar uma nova conta.',
    sign_up_authentication: 'Definição de autenticação para registo',
    verification_tip:
      'Os usuários devem verificar o email ou número de telefone que configurou inserindo um código de verificação durante o registo.',
    authentication_description:
      'Todas as ações selecionadas serão obrigatórias para os utilizadores concluir o processo de registo.',
    set_a_password_option: 'Criar uma senha',
    verify_at_sign_up_option: 'Verificar durante o registo',
    social_only_creation_description: '(Aplica-se apenas à criação de contas sociais)',
  },
  sign_in: {
    title: 'INICIAR SESSÃO',
    sign_in_identifier_and_auth: 'Identificador e definições de autenticação para início de sessão',
    description: 'Os utilizadores podem iniciar sessão usando qualquer uma das opções disponíveis.',
    add_sign_in_method: 'Adicionar Método de Início de Sessão',
    add_sign_up_method: 'Adicionar método de inscrição',
    password_auth: 'Senha',
    verification_code_auth: 'Código de verificação',
    auth_swap_tip: 'Alterne as opções abaixo para determinar qual aparece primeiro no processo.',
    require_auth_factor: 'Tem de selecionar pelo menos um fator de autenticação.',
    forgot_password_verification_method: 'Método de verificação de senha esquecida',
    forgot_password_description:
      'Os utilizadores podem redefinir a sua senha usando qualquer método de verificação disponível.',
    add_verification_method: 'Adicionar método de verificação',
    email_verification_code: 'Código de verificação de email',
    phone_verification_code: 'Código de verificação por telefone',
  },
  social_sign_in: {
    title: 'INÍCIO DE SESSÃO SOCIAL',
    social_sign_in: 'Início de sessão social',
    description:
      'Dependendo do identificador obrigatório que configurou, o utilizador pode ser solicitado a fornecer um identificador ao registar-se através do conector social.',
    add_social_connector: 'Adicionar Conector Social',
    set_up_hint: {
      not_in_list: 'Não está na lista?',
      set_up_more: 'Configurar',
      go_to: 'outros conectores sociais agora.',
    },
    automatic_account_linking: 'Ligação automática de conta',
    automatic_account_linking_label:
      'Quando ativado, se um utilizador iniciar sessão com uma identidade social que é nova para o sistema e existir exatamente uma conta existente com o mesmo identificador (por exemplo, email), o Logto irá automaticamente ligar a conta com a identidade social em vez de solicitar ao utilizador a ligação da conta.',
  },
  tip: {
    set_a_password: 'Um conjunto único de uma senha para o seu nome de utilizador é obrigatório.',
    verify_at_sign_up:
      'Atualmente, apenas suportamos email verificado. A sua base de utilizadores pode conter um grande número de endereços de email de má qualidade se não houver validação.',
    password_auth:
      'Isto é essencial uma vez que ativou a opção de criar uma senha durante o processo de registo.',
    verification_code_auth:
      'Isto é essencial uma vez que apenas ativou a opção de fornecer um código de verificação ao registar-se. É livre de desmarcar a caixa quando a configuração da senha é permitida durante o processo de registo.',
    email_mfa_enabled:
      'O código de verificação de email já está ativado para MFA, portanto não pode ser reutilizado como o método principal de início de sessão por razões de segurança.',
    phone_mfa_enabled:
      'O código de verificação por telefone já está ativado para MFA, portanto não pode ser reutilizado como o método principal de início de sessão por razões de segurança.',
    delete_sign_in_method:
      'Isto é essencial uma vez que selecionou {{identifier}} como um identificador obrigatório.',
    password_disabled_notification:
      'A opção "Criar sua senha" está desativada para registo de nome de utilizador, o que pode impedir os usuários de iniciarem sessão. Confirme para continuar com a gravação.',
  },
  advanced_options: {
    title: 'OPÇÕES AVANÇADAS',
    enable_single_sign_on: 'Ativar início de sessão único da empresa (SSO)',
    enable_single_sign_on_description:
      'Permite aos utilizadores iniciar sessão na aplicação utilizando a autenticação única com as suas identidades empresariais.',
    single_sign_on_hint: {
      prefix: 'Ir para ',
      link: '"SSO Empresarial"',
      suffix: 'seção para configurar mais conectores empresariais.',
    },
    enable_user_registration: 'Ativar registo de utilizadores',
    enable_user_registration_description:
      'Ativar ou desativar o registo de utilizadores. Uma vez desativado, os utilizadores ainda podem ser adicionados na consola de administração, mas os utilizadores não podem mais estabelecer contas através da interface de início de sessão.',
    unknown_session_redirect_url: 'URL de redirecionamento de sessão desconhecida',
    unknown_session_redirect_url_tip:
      'Às vezes, o Logto pode não reconhecer a sessão de um utilizador na página de início de sessão, como quando uma sessão expira ou o utilizador adiciona aos favoritos ou partilha o link de início de sessão. Por padrão, aparece um erro "sessão desconhecida" 404. Para melhorar a experiência do utilizador, defina um URL de fallback para redirecionar os utilizadores de volta para a sua aplicação e reiniciar a autenticação.',
  },
};

export default Object.freeze(sign_up_and_sign_in);

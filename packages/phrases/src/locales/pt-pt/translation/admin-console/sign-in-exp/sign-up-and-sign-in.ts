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
      'O identificador de registo é necessário para a criação de conta e deve ser incluído no ecrã de início de sessão.',
    sign_up_authentication: 'Definição de autenticação para registo',
    authentication_description:
      'Todas as ações selecionadas serão obrigatórias para os utilizadores concluir o processo de registo.',
    set_a_password_option: 'Criar uma senha',
    verify_at_sign_up_option: 'Verificar durante o registo',
    social_only_creation_description: '(Aplica-se apenas à criação de contas sociais)',
  },
  sign_in: {
    title: 'INICIAR SESSÃO',
    sign_in_identifier_and_auth: 'Identificador e definições de autenticação para início de sessão',
    description:
      'Os utilizadores podem iniciar sessão usando qualquer uma das opções disponíveis. Ajuste a disposição arrastando e soltando as opções abaixo.',
    add_sign_in_method: 'Adicionar Método de Início de Sessão',
    password_auth: 'Senha',
    verification_code_auth: 'Código de verificação',
    auth_swap_tip: 'Alterne as opções abaixo para determinar qual aparece primeiro no processo.',
    require_auth_factor: 'Tem de selecionar pelo menos um fator de autenticação.',
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
  },
  tip: {
    set_a_password: 'Um conjunto único de uma senha para o seu nome de utilizador é obrigatório.',
    verify_at_sign_up:
      'Atualmente, apenas suportamos email verificado. A sua base de utilizadores pode conter um grande número de endereços de email de má qualidade se não houver validação.',
    password_auth:
      'Isto é essencial uma vez que ativou a opção de criar uma senha durante o processo de registo.',
    verification_code_auth:
      'Isto é essencial uma vez que apenas ativou a opção de fornecer um código de verificação ao registar-se. É livre de desmarcar a caixa quando a configuração da senha é permitida durante o processo de registo.',
    delete_sign_in_method:
      'Isto é essencial uma vez que selecionou {{identifier}} como um identificador obrigatório.',
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
  },
};

export default Object.freeze(sign_up_and_sign_in);

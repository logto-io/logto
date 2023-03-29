const sign_up_and_sign_in = {
  identifiers_email: 'Endereço de e-mail',
  identifiers_phone: 'Número de telefone',
  identifiers_username: 'Nome de usuário',
  identifiers_email_or_sms: 'Endereço de e-mail ou número de telefone',
  identifiers_none: 'Não aplicável',
  and: 'e',
  or: 'ou',
  sign_up: {
    title: 'INSCREVER-SE',
    sign_up_identifier: 'Identificador de inscrição',
    identifier_description:
      'O identificador de inscrição é necessário para a criação da conta e deve ser incluído na tela de login.',
    sign_up_authentication: 'Configuração de autenticação para inscrição',
    authentication_description:
      'Todas as ações selecionadas serão obrigatórias para os usuários completarem o fluxo.',
    set_a_password_option: 'Crie sua senha',
    verify_at_sign_up_option: 'Visualize na inscrição',
    social_only_creation_description: '(Isso se aplica apenas à criação de contas sociais)',
  },
  sign_in: {
    title: 'ENTRAR',
    sign_in_identifier_and_auth: 'Configurações de identificador e autenticação para login',
    description:
      'Os usuários podem entrar usando qualquer uma das opções disponíveis. Ajuste o layout arrastando e soltando as opções abaixo.',
    add_sign_in_method: 'Adicionar método de login',
    password_auth: 'Senha',
    verification_code_auth: 'Código de verificação',
    auth_swap_tip: 'Troque as opções abaixo para determinar qual aparece primeiro no fluxo.',
    require_auth_factor: 'Você deve selecionar pelo menos um fator de autenticação.',
  },
  social_sign_in: {
    title: 'LOGIN SOCIAL',
    social_sign_in: 'Login social',
    description:
      'Dependendo do identificador obrigatório que você configurou, seu usuário pode ser solicitado a fornecer um identificador ao se inscrever via conector social.',
    add_social_connector: 'Adicionar Conector Social',
    set_up_hint: {
      not_in_list: 'Não está na lista?',
      set_up_more: 'Configurar',
      go_to: 'outros conectores sociais agora.',
    },
  },
  tip: {
    set_a_password: 'Um conjunto exclusivo de uma senha para o seu nome de usuário é obrigatório.',
    verify_at_sign_up:
      'No momento, suportamos apenas e-mail verificado. Sua base de usuários pode conter um grande número de endereços de e-mail de baixa qualidade se não houver validação.',
    password_auth:
      'Isso é essencial, pois você habilitou a opção de definir uma senha durante o processo de inscrição.',
    verification_code_auth:
      'Isso é essencial, pois você habilitou apenas a opção de fornecer o código de verificação ao se inscrever. Você pode desmarcar a caixa quando a configuração de senha for permitida no processo de inscrição.',
    delete_sign_in_method:
      'Isso é essencial, pois você selecionou {{identifier}} como um identificador obrigatório.',
  },
};
export default sign_up_and_sign_in;

const profile = {
  page_title: 'Configurações da conta',
  title: 'Configurações da conta',
  description:
    'Altere suas configurações de conta e gerencie suas informações pessoais aqui para garantir a segurança da sua conta.',
  settings: {
    title: 'CONFIGURAÇÕES DO PERFIL',
    profile_information: 'Informações do perfil',
    avatar: 'Avatar',
    name: 'Nome',
    username: 'Nome de usuário',
  },
  link_account: {
    title: 'LINKAR CONTA',
    email_sign_in: 'Login por e-mail',
    email: 'E-mail',
    social_sign_in: 'Login social',
    link_email: 'Vincular e-mail',
    link_email_subtitle: 'Vincule seu e-mail para fazer login ou ajudar na recuperação da conta.',
    email_required: 'E-mail obrigatório',
    invalid_email: 'Endereço de e-mail inválido',
    identical_email_address: 'O endereço de e-mail inserido é idêntico ao atual',
    anonymous: 'Anônimo',
  },
  password: {
    title: 'SENHA E SEGURANÇA',
    password: 'Senha',
    password_setting: 'Configuração de senha',
    new_password: 'Nova senha',
    confirm_password: 'Confirme a senha',
    enter_password: 'Digite a senha atual',
    enter_password_subtitle:
      'Verifique se é você para proteger a segurança da sua conta. Por favor, digite sua senha atual antes de alterá-la.',
    set_password: 'Definir senha',
    verify_via_password: 'Verificar via senha',
    show_password: 'Mostrar senha',
    required: 'Senha obrigatória',
    do_not_match: 'As senhas não coincidem. Tente novamente.',
  },
  code: {
    enter_verification_code: 'Digite o código de verificação',
    enter_verification_code_subtitle:
      'O código de verificação foi enviado para <strong>{{target}}</strong>',
    verify_via_code: 'Verificar via código de verificação',
    resend: 'Reenviar código de verificação',
    resend_countdown: 'Reenviar em {{countdown}} segundos',
  },
  delete_account: {
    title: 'EXCLUIR CONTA',
    label: 'Excluir conta',
    description:
      'Excluir sua conta removerá todas as suas informações pessoais, dados do usuário e configurações. Essa ação não pode ser desfeita.',
    button: 'Excluir conta',
    p: {
      has_issue:
        'Lamentamos saber que você deseja excluir sua conta. Antes de poder excluir sua conta, você precisa resolver os seguintes problemas.',
      after_resolved:
        'Assim que resolver os problemas, você poderá excluir sua conta. Não hesite em nos contatar se precisar de alguma assistência.',
      check_information:
        'Lamentamos saber que você deseja excluir sua conta. Por favor, verifique as seguintes informações com cuidado antes de prosseguir.',
      remove_all_data:
        'Excluir sua conta removerá permanentemente todos os dados sobre você na Logto Cloud. Portanto, certifique-se de fazer backup de quaisquer dados importantes antes de prosseguir.',
      confirm_information:
        'Por favor, confirme que as informações acima são o que você esperava. Depois de excluir sua conta, não poderemos recuperá-la.',
      has_admin_role:
        'Como você tem o papel de administrador no seguinte tenant, ele será excluído juntamente com sua conta:',
      has_admin_role_other:
        'Como você tem o papel de administrador nos seguintes tenants, eles serão excluídos juntamente com sua conta:',
      quit_tenant: 'Você está prestes a sair do seguinte tenant:',
      quit_tenant_other: 'Você está prestes a sair dos seguintes tenants:',
    },
    issues: {
      paid_plan: 'O seguinte tenant tem um plano pago, por favor cancele a assinatura primeiro:',
      paid_plan_other:
        'Os seguintes tenants têm planos pagos, por favor cancele as assinaturas primeiro:',
      subscription_status: 'O seguinte tenant tem um problema de status de assinatura:',
      subscription_status_other: 'Os seguintes tenants têm problemas de status de assinatura:',
      open_invoice: 'O seguinte tenant tem uma fatura em aberto:',
      open_invoice_other: 'Os seguintes tenants têm faturas em aberto:',
    },
    error_occurred: 'Ocorreu um erro',
    error_occurred_description: 'Desculpe, algo deu errado ao excluir sua conta:',
    request_id: 'ID da solicitação: {{requestId}}',
    try_again_later:
      'Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com a equipe Logto com o ID da solicitação.',
    final_confirmation: 'Confirmação final',
    about_to_start_deletion:
      'Você está prestes a iniciar o processo de exclusão e essa ação não pode ser desfeita.',
    permanently_delete: 'Excluir permanentemente',
  },
  set: 'Configurar',
  change: 'Alterar',
  link: 'Linkar',
  unlink: 'Deslinkar',
  not_set: 'Não definido',
  change_avatar: 'Alterar avatar',
  change_name: 'Alterar nome',
  change_username: 'Alterar nome de usuário',
  set_name: 'Definir nome',
  email_changed: 'E-mail alterado.',
  password_changed: 'Senha alterada.',
  updated: '{{target}} atualizado.',
  linked: '{{target}} conectada.',
  unlinked: '{{target}} desconectada.',
  email_exists_reminder:
    'Este e-mail {{email}} está associado a uma conta existente. Vincule outro e-mail aqui.',
  unlink_confirm_text: 'Sim, deslinkar',
  unlink_reminder:
    'Os usuários não poderão fazer login com a conta <span></span> se você deslinká-la. Tem certeza de que deseja prosseguir?',
  fields: {
    name: 'Nome',
    name_description:
      'O nome completo do usuário em formato exibível, incluindo todos os componentes do nome (por exemplo, "João Silva").',
    avatar: 'Avatar',
    avatar_description: 'URL da imagem do avatar do usuário.',
    familyName: 'Sobrenome',
    familyName_description: 'O sobrenome do usuário (por exemplo, "Silva").',
    givenName: 'Nome',
    givenName_description: 'O nome do usuário (por exemplo, "João").',
    middleName: 'Nome do meio',
    middleName_description: 'O nome do meio do usuário (por exemplo, "Carlos").',
    nickname: 'Apelido',
    nickname_description: 'Nome casual ou familiar do usuário, que pode diferir do nome legal.',
    preferredUsername: 'Nome de usuário preferido',
    preferredUsername_description:
      'Identificador abreviado pelo qual o usuário deseja ser referenciado.',
    profile: 'Perfil',
    profile_description:
      'URL da página de perfil legível do usuário (por exemplo, perfil de mídia social).',
    website: 'Site',
    website_description: 'URL do site pessoal ou blog do usuário.',
    gender: 'Gênero',
    gender_description:
      'O gênero autoidentificado do usuário (por exemplo, "Feminino", "Masculino", "Não-binário").',
    birthdate: 'Data de nascimento',
    birthdate_description:
      'A data de nascimento do usuário em um formato específico (por exemplo, "dd-MM-yyyy").',
    zoneinfo: 'Fuso horário',
    zoneinfo_description:
      'O fuso horário do usuário no formato IANA (por exemplo, "America/Sao_Paulo" ou "Europe/Lisbon").',
    locale: 'Idioma',
    locale_description:
      'O idioma do usuário no formato IETF BCP 47 (por exemplo, "pt-BR" ou "en-US").',
    address: {
      formatted: 'Endereço',
      streetAddress: 'Endereço',
      locality: 'Cidade',
      region: 'Estado',
      postalCode: 'CEP',
      country: 'País',
    },
    address_description:
      'O endereço completo do usuário em formato exibível, incluindo todos os componentes do endereço (por exemplo, "Rua Principal, 123, Cidade, Brasil 12345-678").',
    fullname: 'Nome completo',
    fullname_description:
      'Combina flexivelmente sobrenome, nome e nome do meio com base na configuração.',
  },
};

export default Object.freeze(profile);

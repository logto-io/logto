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
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    name_description:
      "The user's full name in displayable form including all name parts (e.g., “Jane Doe”).",
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    avatar_description: "URL of the user's avatar image.",
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    familyName_description: 'The user\'s surname(s) or last name(s) (e.g., "Doe").',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    givenName_description: 'The user\'s given name(s) or first name(s) (e.g., "Jane").',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    middleName_description: 'The user\'s middle name(s) (e.g., "Marie").',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    nickname_description:
      'Casual or familiar name for the user, which may differ from their legal name.',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    preferredUsername_description:
      'Shorthand identifier by which the user wishes to be referenced.',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    profile_description:
      "URL of the user's human-readable profile page (e.g., social media profile).",
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    website_description: "URL of the user's personal website or blog.",
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    gender_description: 'The user\'s self-identified gender (e.g., "Female", "Male", "Non-binary")',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    birthdate_description: 'The user\'s date of birth in a specified format (e.g., "MM-dd-yyyy").',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    zoneinfo_description:
      'The user\'s timezone in IANA format (e.g., "America/New_York" or "Europe/Paris").',
    /** UNTRANSLATED */
    locale: 'Language',
    /** UNTRANSLATED */
    locale_description: 'The user\'s language in IETF BCP 47 format (e.g., "en-US" or "zh-CN").',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
    /** UNTRANSLATED */
    address_description:
      'The user\'s full address in displayable form including all address parts (e.g., "123 Main St, Anytown, USA 12345").',
    /** UNTRANSLATED */
    fullname: 'Fullname',
    /** UNTRANSLATED */
    fullname_description:
      'Flexibly combines familyName, givenName, and middleName based on configuration.',
  },
};

export default Object.freeze(profile);

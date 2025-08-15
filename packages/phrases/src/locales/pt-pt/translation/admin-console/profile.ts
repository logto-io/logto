const profile = {
  page_title: 'Definições da conta',
  title: 'Definições da conta',
  description:
    'Altere as suas definições de conta e gerencie suas informações pessoais aqui para garantir a segurança da sua conta.',
  settings: {
    title: 'DEFINIÇÕES DO PERFIL',
    profile_information: 'Informação do perfil',
    avatar: 'Avatar',
    name: 'Nome',
    username: 'Nome de usuário',
  },
  link_account: {
    title: 'LIGAR CONTA',
    email_sign_in: 'Registo de email',
    email: 'Email',
    social_sign_in: 'Registo social',
    link_email: 'Ligar email',
    link_email_subtitle:
      'Ligue o seu e-mail para fazer login ou ajudar na recuperação da sua conta.',
    email_required: 'Email é obrigatório',
    invalid_email: 'Endereço de email inválido',
    identical_email_address: 'O endereço de email inserido é idêntico ao atual',
    anonymous: 'Anónimo',
  },
  password: {
    title: 'PALAVRA-PASSE E SEGURANÇA',
    password: 'Palavra-passe',
    password_setting: 'Configuração da palavra-passe',
    new_password: 'Nova palavra-passe',
    confirm_password: 'Confirmar palavra-passe',
    enter_password: 'Introduza a palavra-passe atual',
    enter_password_subtitle:
      'Verifique se é realmente você para proteger a segurança da sua conta. Por favor, introduza a sua palavra-passe atual antes de a alterar.',
    set_password: 'Definir palavra-passe',
    verify_via_password: 'Verificar através da palavra-passe',
    show_password: 'Mostrar palavra-passe',
    required: 'Palavra-passe é obrigatória',
    do_not_match: 'As palavras-passe não correspondem. Por favor, tente novamente.',
  },
  code: {
    enter_verification_code: 'Introduzir código de verificação',
    enter_verification_code_subtitle:
      'O código de verificação foi enviado para <strong>{{target}}</strong>',
    verify_via_code: 'Verificar através do código de verificação',
    resend: 'Reenviar código de verificação',
    resend_countdown: 'Reenviar em {{countdown}} segundos',
  },
  delete_account: {
    title: 'APAGAR CONTA',
    label: 'Apagar conta',
    description:
      'Apagar a sua conta irá remover todas as suas informações pessoais, dados de usuário e configurações. Esta ação não pode ser desfeita.',
    button: 'Apagar conta',
    p: {
      has_issue:
        'Lamentamos saber que você deseja apagar a sua conta. Antes de poder apagar a sua conta, precisa resolver os seguintes problemas.',
      after_resolved:
        'Depois de resolver os problemas, poderá apagar a sua conta. Por favor, não hesite em entrar em contacto connosco se precisar de assistência.',
      check_information:
        'Lamentamos saber que você deseja apagar a sua conta. Verifique a seguinte informação cuidadosamente antes de continuar.',
      remove_all_data:
        'Apagar a sua conta irá remover permanentemente todos os dados sobre você na Logto Cloud. Por isso, assegure-se de fazer backup de quaisquer dados importantes antes de continuar.',
      confirm_information:
        'Por favor confirme que a informação acima é o que esperava. Após apagar a sua conta, não poderemos recuperá-la.',
      has_admin_role:
        'Visto que você tem o papel de administrador no seguinte inquilino, ele será apagado junto com a sua conta:',
      has_admin_role_other:
        'Visto que você tem o papel de administrador nos seguintes inquilinos, eles serão apagados junto com a sua conta:',
      quit_tenant: 'Você está prestes a sair do seguinte inquilino:',
      quit_tenant_other: 'Você está prestes a sair dos seguintes inquilinos:',
    },
    issues: {
      paid_plan: 'O seguinte inquilino tem um plano pago, por favor cancele a subscrição primeiro:',
      paid_plan_other:
        'Os seguintes inquilinos têm planos pagos, por favor cancele a subscrição primeiro:',
      subscription_status: 'O seguinte inquilino tem um problema de estado de subscrição:',
      subscription_status_other: 'Os seguintes inquilinos têm problemas de estado de subscrição:',
      open_invoice: 'O seguinte inquilino tem uma fatura em aberto:',
      open_invoice_other: 'Os seguintes inquilinos têm faturas em aberto:',
    },
    error_occurred: 'Ocorreu um erro',
    error_occurred_description: 'Desculpe, algo correu mal ao apagar a sua conta:',
    request_id: 'ID do pedido: {{requestId}}',
    try_again_later:
      'Por favor, tente novamente mais tarde. Se o problema persistir, contacte a equipa da Logto com o ID do pedido.',
    final_confirmation: 'Confirmação final',
    about_to_start_deletion:
      'Você está prestes a iniciar o processo de exclusão e esta ação não pode ser desfeita.',
    permanently_delete: 'Apagar permanentemente',
  },
  set: 'Definir',
  change: 'Mudar',
  link: 'Ligar',
  unlink: 'Desligar',
  not_set: 'Não definido',
  change_avatar: 'Mudar avatar',
  change_name: 'Mudar nome',
  change_username: 'Mudar nome de usuário',
  set_name: 'Definir nome',
  email_changed: 'Email alterado.',
  password_changed: 'Palavra-passe alterada.',
  updated: '{{target}} atualizado.',
  linked: '{{target}} ligado.',
  unlinked: '{{target}} desligado.',
  email_exists_reminder:
    'Este email {{email}} está associado a uma conta existente. Conecte outro email aqui.',
  unlink_confirm_text: 'Sim, desligar',
  unlink_reminder:
    'Os usuários não poderão entrar com a conta <span></span> se você a desligar. Tem a certeza de que deseja prosseguir?',
  fields: {
    name: 'Nome',
    name_description:
      'O nome completo do usuário em formato exibível, incluindo todos os componentes do nome (por exemplo, "João Silva").',
    avatar: 'Avatar',
    avatar_description: 'URL da imagem do avatar do usuário.',
    familyName: 'Apelido',
    familyName_description: 'O(s) sobrenome(s) do usuário (por exemplo, "Silva").',
    givenName: 'Nome próprio',
    givenName_description: 'O(s) nome(s) próprio(s) do usuário (por exemplo, "João").',
    middleName: 'Nome do meio',
    middleName_description: 'O(s) nome(s) do meio do usuário (por exemplo, "Miguel").',
    nickname: 'Alcunha',
    nickname_description:
      'Nome casual ou familiar para o usuário, que pode diferir do seu nome legal.',
    preferredUsername: 'Nome de usuário preferido',
    preferredUsername_description:
      'Identificador abreviado pelo qual o usuário deseja ser referenciado.',
    profile: 'Perfil',
    profile_description:
      'URL da página de perfil legível por humanos do usuário (por exemplo, perfil de rede social).',
    website: 'Website',
    website_description: 'URL do website pessoal ou blog do usuário.',
    gender: 'Género',
    gender_description:
      'O género autoidentificado do usuário (por exemplo, "Feminino", "Masculino", "Não-binário").',
    birthdate: 'Data de nascimento',
    birthdate_description:
      'A data de nascimento do usuário num formato especificado (por exemplo, "dd-MM-aaaa").',
    zoneinfo: 'Fuso horário',
    zoneinfo_description:
      'O fuso horário do usuário no formato IANA (por exemplo, "Europe/Lisbon" ou "America/Sao_Paulo").',
    locale: 'Idioma',
    locale_description:
      'O idioma do usuário no formato IETF BCP 47 (por exemplo, "pt-PT" ou "en-US").',
    address: {
      formatted: 'Morada',
      streetAddress: 'Morada da rua',
      locality: 'Cidade',
      region: 'Estado',
      postalCode: 'Código postal',
      country: 'País',
    },
    address_description:
      'A morada completa do usuário em formato exibível, incluindo todos os componentes da morada (por exemplo, "Rua Principal 123, Lisboa, Portugal 1000-000").',
    fullname: 'Nome completo',
    fullname_description:
      'Combina flexivelmente familyName, givenName e middleName com base na configuração.',
  },
};

export default Object.freeze(profile);

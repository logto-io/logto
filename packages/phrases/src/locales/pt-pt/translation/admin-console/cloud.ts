const cloud = {
  general: {
    onboarding: 'Introdução',
  },
  welcome: {
    page_title: 'Bem-vindo',
    title: 'Bem-vindo ao Logto Cloud! Gostaríamos de aprender um pouco sobre você.',
    description:
      'Vamos tornar a experiência da Logto única para você conhecendo você melhor. Suas informações estão seguras conosco.',
    project_field: 'Estou usando a Logto para',
    project_options: {
      personal: 'Projeto pessoal',
      company: 'Projeto da empresa',
    },
    company_name_field: 'Nome da empresa',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
    },
  },
  sie: {
    page_title: 'Personalize a experiência de login',
    title: 'Vamos personalizar a sua experiência de login com facilidade',
    inspire: {
      title: 'Crie exemplos convincentes',
      description:
        'Sentindo-se inseguro/a sobre a experiência de login? Basta clicar em "Me inspire" e deixar a mágica acontecer!',
      inspire_me: 'Me inspire',
    },
    logo_field: 'Logotipo do aplicativo',
    color_field: 'Cor da marca',
    identifier_field: 'Identificador',
    identifier_options: {
      email: 'E-mail',
      phone: 'Telefone',
      user_name: 'Nome de usuário',
    },
    authn_field: 'Autenticação',
    authn_options: {
      password: 'Senha',
      verification_code: 'Código de verificação',
    },
    social_field: 'Login social',
    finish_and_done: 'Terminar e pronto',
    preview: {
      mobile_tab: 'Celular',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Desbloqueado mais tarde',
      unlocked_later_tip:
        'Depois de concluir o processo de integração e entrar no produto, você terá acesso a ainda mais métodos de login social.',
      notice:
        'Evite usar o conector de demonstração para fins de produção. Depois de concluído o teste, exclua gentilmente o conector de demonstração e configure o seu próprio conector com suas credenciais.',
    },
  },
  socialCallback: {
    title: 'Você entrou com sucesso',
    description:
      'Você entrou com sucesso usando sua conta social. Para garantir uma integração perfeita e acesso a todos os recursos do Logto, recomendamos que você prossiga para configurar seu próprio conector social.',
  },
  tenant: {
    create_tenant: 'Criar novo inquilino',
  },
};

export default Object.freeze(cloud);

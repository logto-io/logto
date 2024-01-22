const cloud = {
  general: {
    onboarding: 'Introdução',
  },
  welcome: {
    page_title: 'Bem-vindo',
    title: 'Bem-vindo ao Logto Cloud! Gostaríamos de aprender um pouco sobre si.',
    description:
      'Vamos tornar a experiência da Logto única para si conhecendo-o melhor. As suas informações estão seguras connosco.',
    project_field: 'Estou a usar a Logto para',
    project_options: {
      personal: 'Projeto pessoal',
      company: 'Projeto da empresa',
    },
    company_name_field: 'Nome da empresa',
    company_name_placeholder: 'Acme.co',
    stage_field: 'Em que fase está atualmente o seu produto?',
    stage_options: {
      new_product: 'Iniciar um novo projeto e procurar uma solução rápida e pronta a usar',
      existing_product:
        'Migrar da autenticação atual (p. ex., autenticação feita por si, Auth0, Cognito, Microsoft)',
      target_enterprise_ready:
        'Acabei de conquistar clientes mais importantes e agora pretendo preparar o meu produto para vender a empresas',
    },
    additional_features_field: 'Tem algo mais que queira que saibamos?',
    additional_features_options: {
      customize_ui_and_flow:
        'Construir e gerir a minha própria IU, não apenas usar a solução pré-construída e personalizável da Logto',
      compliance: 'A conformidade SOC2 e GDPR são imprescindíveis',
      export_user_data: 'Necessidade de exportar dados de utilizadores da Logto',
      budget_control: 'Tenho um controlo orçamental muito apertado',
      bring_own_auth:
        'Tenho os meus próprios serviços de autenticação e só preciso de algumas funcionalidades da Logto',
      others: 'Nenhuma das acima mencionadas',
    },
  },
  sie: {
    page_title: 'Personalize a Experiência de Login',
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
      user_name: 'Nome de utilizador',
    },
    authn_field: 'Autenticação',
    authn_options: {
      password: 'Senha',
      verification_code: 'Código de verificação',
    },
    social_field: 'Login social',
    finish_and_done: 'Terminar e pronto',
    preview: {
      mobile_tab: 'Telemóvel',
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
    title: 'Entrou com Sucesso',
    description:
      'Entrou com sucesso usando a sua conta social. Para garantir uma integração perfeita e acesso a todos os recursos da Logto, recomendamos que prossiga para configurar o seu próprio conector social.',
  },
  tenant: {
    create_tenant: 'Criar novo inquilino',
  },
};

export default Object.freeze(cloud);

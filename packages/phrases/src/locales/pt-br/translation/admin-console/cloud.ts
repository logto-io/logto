const cloud = {
  general: {
    onboarding: 'Integração',
  },
  welcome: {
    page_title: 'Bem-vindo',
    title: 'Bem-vindo ao Logto Cloud! Gostaríamos de conhecer um pouco sobre você.',
    description:
      'Vamos tornar sua experiência Logto única, conhecendo você melhor. Suas informações estão seguras conosco.',
    project_field: 'Estou usando o Logto para',
    project_options: {
      personal: 'Projeto pessoal',
      company: 'Projeto da empresa',
    },
    company_name_field: 'Nome da empresa',
    company_name_placeholder: 'Acme.co',
    stage_field: 'Em qual estágio seu produto está atualmente?',
    stage_options: {
      new_product: 'Iniciar um novo projeto e procurar por uma solução rápida e pronta para uso',
      existing_product:
        'Migrar da autenticação atual (por exemplo, construída internamente, Auth0, Cognito, Microsoft)',
      target_enterprise_ready:
        'Acabei de conseguir clientes maiores e agora estou preparando meu produto para vender para empresas',
    },
    additional_features_field: 'Você tem mais alguma coisa que deseja que saibamos?',
    additional_features_options: {
      customize_ui_and_flow:
        'Construir e gerenciar minha própria interface de usuário, e não apenas usar a solução pré-construída e personalizável do Logto',
      compliance: 'SOC2 e GDPR são imprescindíveis',
      export_user_data: 'Preciso da capacidade de exportar dados do usuário do Logto',
      budget_control: 'Tenho controle de orçamento muito rígido',
      bring_own_auth:
        'Tenho meus próprios serviços de autenticação e apenas preciso de alguns recursos do Logto',
      others: 'Nenhuma das opções acima',
    },
  },
  create_tenant: {
    page_title: 'Criar inquilino',
    title: 'Crie seu primeiro inquilino',
    description:
      'Um inquilino é um ambiente isolado onde você pode gerenciar identidades de usuário, aplicações e todos os outros recursos do Logto.',
    invite_collaborators: 'Convide seus colaboradores por e-mail',
  },
  sie: {
    page_title: 'Personalize a experiência de logon',
    title: 'Vamos personalizar sua experiência de logon facilmente',
    inspire: {
      title: 'Crie exemplos convincentes',
      description:
        'Sentindo-se inseguro sobre a experiência de login? Basta clicar em "Inspirar-me" e deixar a mágica acontecer!',
      inspire_me: 'Inspirar-me',
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
    finish_and_done: 'Finalizar e feito',
    preview: {
      mobile_tab: 'Celular',
      web_tab: 'Internet',
    },
    connectors: {
      unlocked_later: 'Desbloqueado mais tarde',
      unlocked_later_tip:
        'Assim que você concluir o processo de integração e entrar no produto, terá acesso a ainda mais métodos de login social.',
      notice:
        'Evite usar o conector de demonstração para fins de produção. Depois de concluídos os testes, exclua gentilmente o conector de demonstração e configure seu próprio conector com suas credenciais.',
    },
  },
  socialCallback: {
    title: 'Você entrou com sucesso',
    description:
      'Você entrou com sucesso usando sua conta social. Para garantir a integração perfeita e o acesso a todos os recursos do Logto, recomendamos que você prossiga para configurar seu próprio conector social.',
  },
  tenant: {
    create_tenant: 'Criar inquilino',
  },
};

export default Object.freeze(cloud);

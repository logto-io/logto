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
    title_field: 'Selecione o(s) título(s) aplicável(eis)',
    title_options: {
      developer: 'Desenvolvedor',
      team_lead: 'Líder de equipe',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Produto',
      others: 'Outros',
    },
    company_name_field: 'Nome da empresa',
    company_name_placeholder: 'Acme.co',
    company_size_field: 'Qual o tamanho da sua empresa?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Estou me inscrevendo porque',
    reason_options: {
      passwordless: 'Procurando autenticação sem senha e kit de IU',
      efficiency: 'Encontrando infraestrutura de identidade pronta para uso',
      access_control: 'Controlando o acesso do usuário com base em funções e responsabilidades',
      multi_tenancy: 'Buscando estratégias para um produto multi-inquilino',
      enterprise: 'Encontrando soluções SSO para prontidão corporativa',
      others: 'Outros',
    },
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

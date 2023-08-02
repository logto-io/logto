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
    title_field: 'Selecione o(s) título(s) aplicável(veis)',
    title_options: {
      developer: 'Desenvolvedor/a',
      team_lead: 'Líder de equipe',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Produto',
      others: 'Outros',
    },
    company_name_field: 'Nome da empresa',
    company_name_placeholder: 'Acme.co',
    company_size_field: 'Qual é o tamanho da sua empresa?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Estou me registrando porque',
    reason_options: {
      passwordless: 'Busco autenticação sem senha e kit de UI',
      efficiency: 'Busco infraestrutura de identidade out-of-the-box',
      access_control: 'Controlar o acesso do usuário com base em funções e responsabilidades',
      multi_tenancy: 'Procurando estratégias para um produto com múltiplos locatários',
      enterprise: 'Buscando soluções SSO para produtividade empresarial',
      others: 'Outros',
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

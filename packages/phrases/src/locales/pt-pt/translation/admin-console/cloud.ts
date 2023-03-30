const cloud = {
  welcome: {
    page_title: 'Bem-vindo',
    title: 'Bem-vindo e vamos criar a sua própria visualização da Logto Cloud',
    description:
      'Seja um usuário de código aberto ou de nuvem, faça um passeio pela demonstração e experimente o valor total da Logto. A pré-visualização da nuvem também serve como uma versão preliminar da Logto Cloud.',
    project_field: 'Estou usando a Logto para',
    project_options: {
      personal: 'Projeto pessoal',
      company: 'Projeto da empresa',
    },
    deployment_type_field: 'Prefere código aberto ou nuvem?',
    deployment_type_options: {
      open_source: 'Código aberto',
      cloud: 'Nuvem',
    },
  },
  about: {
    page_title: 'Um pouco sobre você',
    title: 'Um pouco sobre você',
    description:
      'Vamos tornar a experiência da Logto única para você conhecendo você melhor. Suas informações estão seguras conosco.',
    title_field: 'O seu título',
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
  congrats: {
    page_title: 'Ganhe créditos antecipados',
    title: 'Ótima notícia! Você qualifica para ganhar crédito antecipado na Logto Cloud!',
    description:
      'Não perca a oportunidade de aproveitar uma assinatura gratuita de <strong>60 dias</strong> na Logto Cloud após o lançamento oficial! Entre em contato agora com a equipe Logto para saber mais.',
    check_out_button: 'Confira a visualização ao vivo',
    reserve_title: 'Agende seu horário com a equipe Logto',
    reserve_description: 'Crédito é elegível apenas uma vez na validação.',
    book_button: 'Agende agora',
    join_description:
      'Junte-se ao nosso <a>{{link}}</a> público para se conectar e conversar com outros desenvolvedores.',
    discord_link: 'canal no discord',
    enter_admin_console: 'Entrar na pré-visualização da Logto Cloud',
  },
  gift: {
    title: 'Use a Logto Cloud gratuitamente por 60 dias. Junte-se aos pioneiros agora!',
    description: 'Agende uma sessão individual com nossa equipe para obter crédito antecipado.',
    reserve_title: 'Agende seu horário com a equipe Logto',
    reserve_description: 'Crédito é elegível apenas uma vez na avaliação.',
    book_button: 'Agendar',
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
  broadcast: '📣 Você está na Logto Cloud (Visualização)',
  socialCallback: {
    title: 'Você entrou com sucesso',
    description:
      'Você entrou com sucesso usando sua conta social. Para garantir uma integração perfeita e acesso a todos os recursos do Logto, recomendamos que você prossiga para configurar seu próprio conector social.',
  },
};

export default cloud;

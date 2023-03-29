const cloud = {
  welcome: {
    page_title: 'Boas-vindas',
    title: 'Boas-vindas e vamos criar sua própria visualização de nuvem Logto',
    description:
      'Se você é um usuário de código aberto ou de nuvem, faça um passeio pela vitrine e experimente o valor completo do Logto. A visualização da nuvem também serve como uma versão preliminar da nuvem Logto.',
    project_field: 'Estou usando o Logto para',
    project_options: {
      personal: 'Projeto pessoal',
      company: 'Projeto da empresa',
    },
    deployment_type_field: 'Preferencialmente de código aberto ou na nuvem?',
    deployment_type_options: {
      open_source: 'Código aberto',
      cloud: 'Nuvem',
    },
  },
  about: {
    page_title: 'Um pouco sobre você',
    title: 'Um pouco sobre você',
    description:
      'Vamos tornar sua experiência Logto única, conhecendo você melhor. Suas informações estão seguras conosco.',
    title_field: 'O seu título',
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
  congrats: {
    page_title: 'Ganhe créditos antecipados',
    title: 'Ótimas notícias! Você está qualificado para ganhar crédito antecipado da Logto Cloud!',
    description:
      'Não perca a chance de desfrutar de uma assinatura gratuita de <strong>60 dias</strong> da Logto Cloud após o lançamento oficial! Entre em contato com a equipe da Logto agora para obter mais informações.',
    check_out_button: 'Confira a visualização ao vivo',
    reserve_title: 'Reserve seu horário com a equipe da Logto',
    reserve_description: 'O crédito é elegível apenas uma vez na validação.',
    book_button: 'Agendar agora',
    join_description:
      'Junte-se a nosso <a>{{link}}</a> público para se conectar e conversar com outros desenvolvedores.',
    discord_link: 'canal Discord',
    enter_admin_console: 'Entrar na visualização Logto Cloud',
  },
  gift: {
    title: 'Use a nuvem Logto gratuitamente por 60 dias. Junte-se aos primeiros usuários agora!',
    description: 'Agende uma sessão individual com nossa equipe para crédito antecipado.',
    reserve_title: 'Reserve seu horário com a equipe da Logto',
    reserve_description: 'O crédito é elegível somente após a avaliação.',
    book_button: 'Agendar',
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
  broadcast: '📣 Você está na nuvem Logto (Visualização)',
  socialCallback: {
    title: 'Você entrou com sucesso',
    description:
      'Você entrou com sucesso usando sua conta social. Para garantir a integração perfeita e o acesso a todos os recursos do Logto, recomendamos que você prossiga para configurar seu próprio conector social.',
  },
};

export default cloud;

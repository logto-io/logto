const cloud = {
  general: {
    onboarding: 'Introdução',
  },
  create_tenant: {
    page_title: 'Criar inquilino',
    title: 'Crie o seu primeiro inquilino',
    description:
      'Um inquilino é um ambiente isolado onde pode gerir identidades de utilizadores, aplicações e todos os demais recursos da Logto.',
    invite_collaborators: 'Convide os seus colaboradores por email',
    hear_about_us: {
      title: 'Como ouviu falar da Logto pela primeira vez?',
      detail_placeholder: 'Conte-nos mais (opcional)',
      options: {
        search_engine: 'Motor de pesquisa (Google, Bing...)',
        ai_assistant: 'Assistente de IA (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub ou diretórios de código aberto',
        friend_colleague: 'Um amigo ou colega',
        powered_by: 'Página de início de sessão de uma aplicação que usa a Logto',
        content_social: 'Redes sociais, artigo ou vídeo (YouTube, X, Reddit...)',
        other: 'Outro',
      },
    },
  },
  social_callback: {
    title: 'Entrou com Sucesso',
    description:
      'Entrou com sucesso usando a sua conta social. Para garantir uma integração perfeita e acesso a todos os recursos da Logto, recomendamos que prossiga para configurar o seu próprio conector social.',
    notice:
      'Por favor evite usar o conector de demonstração para fins de produção. Após concluir os testes, elimine o conector de demonstração e configure o seu próprio conector com as suas credenciais.',
  },
  tenant: {
    create_tenant: 'Criar novo inquilino',
  },
};

export default Object.freeze(cloud);

const cloud = {
  general: {
    onboarding: 'Integração',
  },
  create_tenant: {
    page_title: 'Criar inquilino',
    title: 'Crie seu primeiro inquilino',
    description:
      'Um inquilino é um ambiente isolado onde você pode gerenciar identidades de usuário, aplicações e todos os outros recursos do Logto.',
    invite_collaborators: 'Convide seus colaboradores por e-mail',
    hear_about_us: {
      title: 'Como você ouviu falar do Logto pela primeira vez?',
      detail_placeholder: 'Conte-nos mais (opcional)',
      options: {
        search_engine: 'Mecanismo de busca (Google, Bing...)',
        ai_assistant: 'Assistente de IA (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub ou diretórios de código aberto',
        friend_colleague: 'Um amigo ou colega',
        powered_by: 'Página de login de um aplicativo que usa o Logto',
        content_social: 'Redes sociais, artigo ou vídeo (YouTube, X, Reddit...)',
        other: 'Outro',
      },
    },
  },
  social_callback: {
    title: 'Você entrou com sucesso',
    description:
      'Você entrou com sucesso usando sua conta social. Para garantir a integração perfeita e o acesso a todos os recursos do Logto, recomendamos que você prossiga para configurar seu próprio conector social.',
    notice:
      'Por favor, evite usar o conector de demonstração para fins de produção. Depois de concluir os testes, gentilmente exclua o conector de demonstração e configure seu próprio conector com suas credenciais.',
  },
  tenant: {
    create_tenant: 'Criar inquilino',
  },
};

export default Object.freeze(cloud);

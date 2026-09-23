const cloud = {
  console_sso: {
    back_to_list: 'Voltar ao SSO da Consola',
    create: 'Adicionar conector',
    title: 'SSO da consola',
    description:
      'Configure o seu próprio fornecedor de identidade para aceder ao Logto Console com início de sessão único.',
    domain_bound: 'Associado',
    domain_pending: 'A verificar',
    domain_add_placeholder: 'Adicionar um domínio de e-mail',
    domain_bound_description:
      'Este domínio está ativo para Console SSO. O registo TXT de verificação foi removido.',
    domain_dns_instructions:
      'Adicione este registo TXT no seu fornecedor de DNS para verificar a propriedade do domínio.',
    domain_waiting_for_dns: 'A aguardar o registo TXT. Voltaremos a verificar a cada 10 segundos.',
    domain_proven_unbound:
      'A propriedade do domínio foi verificada, mas a associação está incompleta.',
    domain_remove_description:
      'Remover {{domain}} do Console SSO? A remoção de um domínio associado interrompe a descoberta de SSO para os seus endereços de e-mail.',
    domain_invalid: 'Introduza um domínio de e-mail válido.',
    domain_conflict: 'Este domínio já está associado a outro conector Console SSO.',
    domain_invalid_provider: 'Conclua as definições de ligação antes de associar este domínio.',
    domain_dns_timeout: 'A verificação DNS falhou. Voltaremos a tentar automaticamente.',
    domain_recovery: 'A alteração do domínio está incompleta.',
    start_over: 'Recomeçar',
    start_over_confirmation:
      'Recomeçar pode eliminar a sua configuração de SSO incompleta. Pretende continuar?',
    resume_creation:
      'Foi encontrada uma criação incompleta. Continue com o mesmo fornecedor para recuperar este conector.',
  },
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

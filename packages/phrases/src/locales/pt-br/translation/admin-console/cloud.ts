const cloud = {
  self_hosted_licenses: {
    title: 'Licenças auto-hospedadas',
    description:
      'Veja as licenças da sua conta e copie as chaves para suas implantações auto-hospedadas.',
    empty_title: 'Ainda não há licenças auto-hospedadas',
    empty_description:
      'As licenças atribuídas a esta conta aparecerão aqui. Não é necessário um tenant Cloud.',
    load_error: 'Não foi possível carregar as licenças. Tente novamente.',
    period_end: 'Fim do período atual',
    keys_title: 'Chaves de licença',
    keys_description: 'Mantenha estas chaves em sigilo. Use a chave adequada ao seu ambiente.',
    production_key: 'Chave de produção',
    non_production_key: 'Chave de não produção',
    keys_unavailable:
      'As chaves desta licença estão indisponíveis. Entre em contato com o suporte se precisar de ajuda.',
    issue_keys: 'Emitir ambas as chaves de licença',
    issue_error: 'Não foi possível emitir as chaves de licença. Tente novamente.',
    install_title: 'Instale sua licença',
    install_description:
      'Ambas as chaves oferecem os mesmos recursos e cotas. A chave instalada identifica sua implantação como de produção ou de não produção.',
    install_copy:
      'Copie a chave de produção para produção ou a chave de não produção para desenvolvimento e testes.',
    install_paste:
      'No console auto-hospedado, abra Configurações → Licença, cole a chave e instale-a.',
    status: {
      active: 'Ativa',
      past_due: 'Pagamento atrasado',
      canceling: 'Cancela ao final do período',
      canceled: 'Cancelada',
      unpaid: 'Não paga',
      expired: 'Expirada',
      revoked: 'Revogada',
    },
  },
  console_sso: {
    back_to_list: 'Voltar para o SSO do Console',
    create: 'Adicionar conector',
    title: 'SSO do console',
    description:
      'Configure seu próprio provedor de identidade para entrar no Logto Console com login único.',
    domain_bound: 'Vinculado',
    domain_pending: 'Verificando',
    domain_verify_step: 'Verifique seu domínio',
    domain_bind_step: 'Vincular domínio de e-mail',
    domain_add_placeholder: 'Adicionar um domínio de e-mail',
    domain_bound_description:
      'Este domínio está ativo para Console SSO. O registro TXT de verificação foi removido.',
    domain_dns_instructions:
      'Adicione este registro TXT ao seu provedor de DNS para verificar a propriedade do domínio.',
    domain_waiting_for_dns:
      'Aguardando o registro TXT. Verificaremos novamente a cada 10 segundos.',
    domain_proven_unbound:
      'A propriedade do domínio foi verificada, mas a vinculação está incompleta.',
    domain_verified: 'A propriedade do domínio foi verificada.',
    domain_binding_pending: 'A vinculação começa automaticamente após a verificação.',
    domain_remove_description:
      'Remover {{domain}} do Console SSO? A remoção de um domínio vinculado interrompe a descoberta de SSO para seus endereços de e-mail.',
    domain_invalid: 'Insira um domínio de e-mail válido.',
    domain_conflict: 'Este domínio já está vinculado a outro conector do Console SSO.',
    domain_invalid_provider: 'Conclua as configurações de conexão antes de vincular este domínio.',
    domain_dns_timeout: 'A verificação de DNS falhou. Tentaremos novamente automaticamente.',
    domain_recovery: 'A alteração do domínio está incompleta.',
    start_over: 'Recomeçar',
    start_over_confirmation:
      'Recomeçar pode excluir sua configuração de SSO incompleta. Deseja continuar?',
    resume_creation:
      'Uma criação incompleta foi encontrada. Continue com o mesmo provedor para recuperar este conector.',
  },
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

const oidc_configs = {
  sessions_card_title: 'Sessões do Logto',
  sessions_card_description:
    'Personalize a política de sessão armazenada pelo servidor de autorização do Logto. Regista o estado global de autenticação do utilizador para ativar SSO e permitir reautenticação silenciosa entre aplicações.',
  session_max_ttl_in_days: 'Tempo de vida máximo da sessão (TTL) em dias',
  session_max_ttl_in_days_tip:
    'Um limite absoluto de duração desde a criação da sessão. Independentemente da atividade, a sessão termina quando esta duração fixa expira.',
  oss_notice:
    'No Logto OSS, reinicie a sua instância após atualizar qualquer configuração OIDC (incluindo configurações de sessão e <keyRotationsLink>rotação de chaves</keyRotationsLink>) para que as alterações tenham efeito. Para aplicar automaticamente todas as atualizações de configuração OIDC sem reiniciar o serviço, <centralCacheLink>ative a cache central</centralCacheLink>.',
};

export default Object.freeze(oidc_configs);

const oidc_configs = {
  sessions_card_title: 'Sessões do Logto',
  sessions_card_description:
    'Personalize a política de sessão armazenada pelo servidor de autorização do Logto. Ela registra o estado global de autenticação do usuário para habilitar SSO e permitir reautenticação silenciosa entre aplicativos.',
  session_max_ttl_in_days: 'Tempo de vida máximo da sessão (TTL) em dias',
  session_max_ttl_in_days_tip:
    'Um limite absoluto de duração a partir da criação da sessão. Independentemente da atividade, a sessão termina quando essa duração fixa expira.',
};

export default Object.freeze(oidc_configs);

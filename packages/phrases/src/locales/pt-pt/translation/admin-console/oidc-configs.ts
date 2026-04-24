const oidc_configs = {
  sessions_card_title: 'Sessões do Logto',
  sessions_card_description:
    'Personalize a política de sessão armazenada pelo servidor de autorização do Logto. Regista o estado global de autenticação do utilizador para ativar SSO e permitir reautenticação silenciosa entre aplicações.',
  session_max_ttl_in_days: 'Tempo de vida máximo da sessão (TTL) em dias',
  session_max_ttl_in_days_tip:
    'Um limite absoluto de duração desde a criação da sessão. Independentemente da atividade, a sessão termina quando esta duração fixa expira.',
  cloud_private_key_rotation_notice:
    'No Logto Cloud, a rotação de chaves privadas entra em vigor após um período de carência de 4 horas.',
};

export default Object.freeze(oidc_configs);

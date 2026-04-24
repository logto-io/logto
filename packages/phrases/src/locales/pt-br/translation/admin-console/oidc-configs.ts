const oidc_configs = {
  sessions_card_title: 'Sessões do Logto',
  sessions_card_description:
    'Personalize a política de sessão armazenada pelo servidor de autorização do Logto. Ela registra o estado global de autenticação do usuário para habilitar SSO e permitir reautenticação silenciosa entre aplicativos.',
  session_max_ttl_in_days: 'Tempo de vida máximo da sessão (TTL) em dias',
  session_max_ttl_in_days_tip:
    'Um limite absoluto de duração a partir da criação da sessão. Independentemente da atividade, a sessão termina quando essa duração fixa expira.',
  oss_notice:
    'No Logto OSS, reinicie sua instância após atualizar qualquer configuração OIDC (incluindo configurações de sessão e <keyRotationsLink>rotação de chaves</keyRotationsLink>) para que as alterações entrem em vigor. Para aplicar automaticamente todas as atualizações de configuração OIDC sem reiniciar o serviço, <centralCacheLink>ative o cache central</centralCacheLink>.',
  cloud_private_key_rotation_notice:
    'No Logto Cloud, a rotação de chaves privadas entra em vigor após um período de carência de 4 horas.',
};

export default Object.freeze(oidc_configs);

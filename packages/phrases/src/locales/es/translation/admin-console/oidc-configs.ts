const oidc_configs = {
  sessions_card_title: 'Sesiones de Logto',
  sessions_card_description:
    'Personalice la política de sesión almacenada por el servidor de autorización de Logto. Registra el estado global de autenticación del usuario para habilitar SSO y permitir la reautenticación silenciosa entre aplicaciones.',
  session_max_ttl_in_days: 'Tiempo de vida máximo de la sesión (TTL) en días',
  session_max_ttl_in_days_tip:
    'Un límite de vida útil absoluto desde la creación de la sesión. Independientemente de la actividad, la sesión termina cuando transcurre esta duración fija.',
};

export default Object.freeze(oidc_configs);

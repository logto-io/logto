const oidc_configs = {
  sessions_card_title: 'Logto sessions',
  sessions_card_description:
    "Customize the session policy stored by the Logto authorization server. It records the user's global auth state to enable SSO and allow silent re-authentication across apps.",
  session_max_ttl_in_days: 'Session maximum time to live (TTL) in days',
  session_max_ttl_in_days_tip:
    'An absolute lifetime limit from session creation. Regardless of activity, the session ends when this fixed duration elapses.',
  oss_notice:
    'For Logto OSS, restart your instance after updating any OIDC configuration (including session settings and <keyRotationsLink>key rotations</keyRotationsLink>) for changes to take effect. To apply all OIDC configuration updates automatically without reloading the service, <centralCacheLink>enable central cache</centralCacheLink>.',
};

export default Object.freeze(oidc_configs);

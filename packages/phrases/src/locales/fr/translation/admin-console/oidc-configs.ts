const oidc_configs = {
  sessions_card_title: 'Sessions Logto',
  sessions_card_description:
    "Personnalisez la politique de session stockée par le serveur d'autorisation Logto. Elle enregistre l'état d'authentification global de l'utilisateur afin d'activer le SSO et de permettre une réauthentification silencieuse entre applications.",
  session_max_ttl_in_days: 'Durée de vie maximale de la session (TTL) en jours',
  session_max_ttl_in_days_tip:
    "Une limite de durée de vie absolue à partir de la création de la session. Quelle que soit l'activité, la session se termine à l'expiration de cette durée fixe.",
  oss_notice:
    'Pour Logto OSS, redémarrez votre instance après toute mise à jour de la configuration OIDC (y compris les paramètres de session et la <keyRotationsLink>rotation des clés</keyRotationsLink>) pour appliquer les changements. Pour appliquer automatiquement toutes les mises à jour de configuration OIDC sans redémarrer le service, <centralCacheLink>activez le cache central</centralCacheLink>.',
  cloud_private_key_rotation_notice:
    'Dans Logto Cloud, la rotation des clés privées prend effet après une période de grâce de 4 heures.',
};

export default Object.freeze(oidc_configs);

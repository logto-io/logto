const application_details = {
  page_title: 'Détails de l application',
  back_to_applications: 'Retour aux applications',
  check_guide: 'Consulter le guide',
  settings: 'Paramètres',
  settings_description:
    "Les applications sont utilisées pour identifier vos applications dans Logto pour OIDC, l'expérience de connexion, les journaux d'audit, etc.",
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    "Les paramètres avancés comprennent des termes liés à OIDC. Vous pouvez consulter le point de terminaison de jeton pour plus d'informations.",
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon App',
  description: 'Description',
  description_placeholder: 'Entrez la description de votre application',
  config_endpoint: 'Point de configuration du fournisseur OpenID',
  authorization_endpoint: "Point de terminaison d'autorisation",
  authorization_endpoint_tip:
    "Le point de terminaison pour effectuer l'authentification et l'autorisation. Il est utilisé pour <a>l'authentification</a> OpenID Connect.",
  logto_endpoint: 'Logto endpoint',
  application_id: "ID de l'application",
  application_id_tip:
    "L'identifiant d'application unique généralement généré par Logto. Il signifie également <a>client_id</a> dans OpenID Connect.",
  application_secret: "Secret de l'application",
  redirect_uri: 'URI de redirection',
  redirect_uris: 'URIs de redirection',
  redirect_uri_placeholder: 'https://votre.site.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    "L'URI de redirection après la connexion d'un utilisateur (qu'elle soit réussie ou non). Voir OpenID Connect <a>AuthRequest</a> pour plus d'informations.",
  post_sign_out_redirect_uri: 'URI de redirection post-signature',
  post_sign_out_redirect_uris: 'URI de redirection après la signature',
  post_sign_out_redirect_uri_placeholder: 'https://votre.site.com/home',
  post_sign_out_redirect_uri_tip:
    "L'URI de redirection après la déconnexion de l'utilisateur (facultatif). Cela peut n'avoir aucun effet pratique dans certains types d'applications.",
  cors_allowed_origins: 'Origines CORS autorisées',
  cors_allowed_origins_placeholder: 'https://votre.site.com',
  cors_allowed_origins_tip:
    "Par défaut, toutes les origines des URI de redirection seront autorisées. En général, aucune action n'est requise pour ce champ. Consultez la documentation <a>MDN</a> pour des informations détaillées.",
  token_endpoint: "Point d'extrémité du jeton",
  user_info_endpoint: "Point d'extrémité Utilisateur",
  enable_admin_access: "Activer l'accès administrateur",
  enable_admin_access_label:
    "Activer ou désactiver l'accès à l'API de gestion. Une fois activé, vous pouvez utiliser des jetons d'accès pour appeler l'API de gestion au nom de cette application.",
  always_issue_refresh_token: 'Toujours émettre le Refresh Token.',
  always_issue_refresh_token_label:
    "En activant cette configuration, Logto pourra toujours émettre des Refresh Tokens, indépendamment de la présentation ou non de la demande d'authentification `prompt=consent`. Cependant, cette pratique est découragée sauf si nécessaire, car elle n'est pas compatible avec OpenID Connect et peut potentiellement causer des problèmes.",
  refresh_token_ttl: 'Durée de vie du rafraîchissement du jeton en jours',
  refresh_token_ttl_tip:
    "La durée pendant laquelle un Refresh Token peut être utilisé pour demander de nouveaux jetons d'accès avant qu'il n'expire et devienne invalide. Les demandes de jeton étendront la durée de vie du Refresh Token à cette valeur.",
  rotate_refresh_token: 'Tourner le Refresh Token',
  rotate_refresh_token_label:
    "Lorsqu'elle est activée, Logto émettra un nouveau Refresh Token pour les demandes de jeton lorsque 70% de la durée de vie (TTL) d'origine est écoulée ou que certaines conditions sont remplies. <a>En savoir plus</a>",
  delete_description:
    "Cette action ne peut être annulée. Elle supprimera définitivement l'application. Veuillez entrer le nom de l'application <span>{{nom}}</span> pour confirmer.",
  enter_your_application_name: 'Entrez le nom de votre application',
  application_deleted: "L'application {{name}} a été supprimée avec succès.",
  redirect_uri_required: 'Vous devez entrer au moins un URI de redirection.',
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_app_count: '{{value, number}} applications',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);

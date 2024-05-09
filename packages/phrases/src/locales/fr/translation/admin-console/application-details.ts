const application_details = {
  page_title: "Détails de l'application",
  back_to_applications: 'Retour aux applications',
  check_guide: 'Consulter le guide',
  settings: 'Paramètres',
  /** UNTRANSLATED */
  settings_description:
    'An "Application" is a registered software or service that can access user info or act for a user. Applications help recognize who’s asking for what from Logto and handle the sign-in and permission. Fill in the required fields for authentication.',
  /** UNTRANSLATED */
  integration: 'Integration',
  /** UNTRANSLATED */
  integration_description:
    "Deploy with Logto secure workers, powered by Cloudflare's edge network for top-tier performance and 0ms cold starts worldwide.",
  /** UNTRANSLATED */
  service_configuration: 'Service configuration',
  /** UNTRANSLATED */
  service_configuration_description: 'Complete the necessary configurations in your service.',
  /** UNTRANSLATED */
  session: 'Session',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Rôles',
  machine_logs: 'Journaux de machine',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon App',
  description: 'Description',
  description_placeholder: 'Entrez la description de votre application',
  config_endpoint: 'Point de configuration du fournisseur OpenID',
  authorization_endpoint: "Point de terminaison d'autorisation",
  authorization_endpoint_tip:
    "Le point de terminaison pour effectuer l'authentification et l'autorisation. Il est utilisé pour <a>l'authentification</a> OpenID Connect.",
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Endpoint Logto',
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
  post_sign_out_redirect_uri: 'URI de redirection post-déconnexion',
  post_sign_out_redirect_uris: 'URI de redirection après la déconnexion',
  post_sign_out_redirect_uri_placeholder: 'https://votre.site.com/home',
  post_sign_out_redirect_uri_tip:
    "L'URI de redirection après la déconnexion de l'utilisateur (facultatif). Cela peut n'avoir aucun effet pratique dans certains types d'applications.",
  cors_allowed_origins: 'Origines CORS autorisées',
  cors_allowed_origins_placeholder: 'https://votre.site.com',
  cors_allowed_origins_tip:
    "Par défaut, toutes les origines des URI de redirection seront autorisées. En général, aucune action n'est requise pour ce champ. Consultez la documentation <a>MDN</a> pour des informations détaillées.",
  token_endpoint: 'Point de terminaison du jeton',
  user_info_endpoint: "Point de terminaison de l'utilisateur",
  enable_admin_access: "Activer l'accès administrateur",
  enable_admin_access_label:
    "Activer ou désactiver l'accès à l'API de gestion. Une fois activé, vous pouvez utiliser des jetons d'accès pour appeler l'API de gestion au nom de cette application.",
  always_issue_refresh_token: 'Toujours émettre le Refresh Token.',
  always_issue_refresh_token_label:
    "En activant cette configuration, Logto pourra toujours émettre des Refresh Tokens, indépendamment de la présentation ou non de la demande d'authentification `prompt=consent`. Cependant, cette pratique est découragée sauf si nécessaire, car elle n'est pas compatible avec OpenID Connect et peut potentiellement causer des problèmes.",
  refresh_token_ttl: 'Durée de vie du Refresh Token en jours',
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
  /** UNTRANSLATED */
  app_domain_description_1:
    'Feel free to use your domain with {{domain}} powered by Logto, which is permanently valid.',
  /** UNTRANSLATED */
  app_domain_description_2:
    'Feel free to utilize your domain <domain>{{domain}}</domain> which is permanently valid.',
  /** UNTRANSLATED */
  custom_rules: 'Custom authentication rules',
  /** UNTRANSLATED */
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  /** UNTRANSLATED */
  custom_rules_description:
    'Set rules with regular expressions for authentication-required routes. Default: full-site protection if left blank.',
  /** UNTRANSLATED */
  authentication_routes: 'Authentication routes',
  /** UNTRANSLATED */
  custom_rules_tip:
    "Here are two case scenarios:<ol><li>To only protect routes '/admin' and '/privacy' with authentication: ^/(admin|privacy)/.*</li><li>To exclude JPG images from authentication: ^(?!.*\\.jpg$).*$</li></ol>",
  /** UNTRANSLATED */
  authentication_routes_description:
    'Redirect your authentication button using the specified routes. Note: These routes are irreplaceable.',
  /** UNTRANSLATED */
  protect_origin_server: 'Protect your origin server',
  /** UNTRANSLATED */
  protect_origin_server_description:
    'Ensure to protect your origin server from direct access. Refer to the guide for more <a>detailed instructions</a>.',
  /** UNTRANSLATED */
  session_duration: 'Session duration (days)',
  /** UNTRANSLATED */
  try_it: 'Try it',
  branding: {
    /** UNTRANSLATED */
    name: 'Branding',
    /** UNTRANSLATED */
    description: "Customize your application's display name and logo on the consent screen.",
    /** UNTRANSLATED */
    more_info: 'More info',
    /** UNTRANSLATED */
    more_info_description: 'Offer users more details about your application on the consent screen.',
    /** UNTRANSLATED */
    display_name: 'Display name',
    /** UNTRANSLATED */
    display_logo: 'Display logo',
    /** UNTRANSLATED */
    display_logo_dark: 'Display logo (dark)',
    /** UNTRANSLATED */
    terms_of_use_url: 'Application terms of use URL',
    /** UNTRANSLATED */
    privacy_policy_url: 'Application privacy policy URL',
  },
  permissions: {
    /** UNTRANSLATED */
    name: 'Permissions',
    /** UNTRANSLATED */
    description:
      'Select the permissions that the third-party application requires for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_permissions: 'Personal user data',
    /** UNTRANSLATED */
    organization_permissions: 'Organization access',
    /** UNTRANSLATED */
    table_name: 'Grant permissions',
    /** UNTRANSLATED */
    field_name: 'Permission',
    /** UNTRANSLATED */
    field_description: 'Displayed in the consent screen',
    /** UNTRANSLATED */
    delete_text: 'Remove permission',
    /** UNTRANSLATED */
    permission_delete_confirm:
      'This action will withdraw the permissions granted to the third-party app, preventing it from requesting user authorization for specific data types. Are you sure you want to continue?',
    /** UNTRANSLATED */
    permissions_assignment_description:
      'Select the permissions the third-party application requests for user authorization to access specific data types.',
    /** UNTRANSLATED */
    user_profile: 'User data',
    /** UNTRANSLATED */
    api_permissions: 'API permissions',
    /** UNTRANSLATED */
    organization: 'Organization permissions',
    /** UNTRANSLATED */
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    /** UNTRANSLATED */
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    /** UNTRANSLATED */
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    /** UNTRANSLATED */
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    /** UNTRANSLATED */
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    /** UNTRANSLATED */
    user_title: 'User',
    /** UNTRANSLATED */
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    /** UNTRANSLATED */
    grant_user_level_permissions: 'Grant permissions of user data',
    /** UNTRANSLATED */
    organization_title: 'Organization',
    /** UNTRANSLATED */
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    /** UNTRANSLATED */
    grant_organization_level_permissions: 'Grant permissions of organization data',
    /** UNTRANSLATED */
    add_permissions_for_organization:
      'Add the API resource permissions used in the "Organization template"',
  },
  roles: {
    name_column: 'Rôle',
    description_column: 'Description',
    assign_button: 'Attribuer des rôles',
    delete_description:
      'Cette action supprimera ce rôle de cette application machine-to-machine. Le rôle lui-même existera toujours, mais il ne sera plus associé à cette application machine-to-machine.',
    deleted: '{{name}} a été supprimé(e) avec succès de cet utilisateur.',
    assign_title: 'Attribuer des rôles à {{name}}',
    assign_subtitle: 'Autoriser {{name}} à un ou plusieurs rôles',
    assign_role_field: 'Attribuer des rôles',
    role_search_placeholder: 'Rechercher par nom de rôle',
    added_text: '{{value, number}} ajouté(s)',
    assigned_app_count: '{{value, number}} applications',
    confirm_assign: 'Assigner des rôles',
    role_assigned: 'Rôle(s) attribué(e)s avec succès',
    search: 'Rechercher par nom de rôle, description ou ID',
    empty: 'Aucun rôle disponible',
  },
};

export default Object.freeze(application_details);

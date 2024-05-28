const application_details = {
  page_title: "Détails de l'application",
  back_to_applications: 'Retour aux applications',
  check_guide: 'Consulter le guide',
  settings: 'Paramètres',
  settings_description:
    'Une "Application" est un logiciel ou un service enregistré qui peut accéder aux infos utilisateur ou agir pour un utilisateur. Les applications aident à reconnaître qui demande quoi à Logto et à gérer la connexion et les autorisations. Remplissez les champs requis pour l\'authentification.',
  integration: 'Intégration',
  integration_description:
    'Déployez avec les travailleurs sécurisés de Logto, alimentés par le réseau Edge de Cloudflare pour des performances de premier plan et des démarrages à froid de 0ms dans le monde entier.',
  service_configuration: 'Configuration du service',
  service_configuration_description: 'Complétez les configurations nécessaires dans votre service.',
  session: 'Session',
  endpoints_and_credentials: "Points de terminaison & Informations d'identification",
  endpoints_and_credentials_description:
    "Utilisez les points de terminaison et les informations d'identification suivants pour configurer la connexion OIDC dans votre application.",
  refresh_token_settings: 'Token de rafraîchissement',
  refresh_token_settings_description:
    'Gérez les règles du jeton de rafraîchissement pour cette application.',
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
  show_endpoint_details: 'Afficher les détails du point de terminaison',
  hide_endpoint_details: 'Masquer les détails du point de terminaison',
  logto_endpoint: 'Point de terminaison Logto',
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
  app_domain_description_1:
    "N'hésitez pas à utiliser votre domaine avec {{domain}} alimenté par Logto, qui est valide en permanence.",
  app_domain_description_2:
    "N'hésitez pas à utiliser votre domaine <domain>{{domain}}</domain> qui est valide en permanence.",
  custom_rules: "Règles d'authentification personnalisées",
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'Définissez des règles avec des expressions régulières pour les routes nécessitant une authentification. Par défaut : protection totale du site si laissé vide.',
  authentication_routes: "Routes d'authentification",
  custom_rules_tip:
    "Voici deux scénarios possibles :<ol><li>Pour protéger uniquement les routes '/admin' et '/privacy' avec une authentification : ^/(admin|privacy)/.*</li><li>Pour exclure les images JPG de l'authentification : ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    "Redirigez votre bouton d'authentification en utilisant les routes spécifiées. Remarque : Ces routes sont inchangeables.",
  protect_origin_server: "Protéger votre serveur d'origine",
  protect_origin_server_description:
    "Assurez-vous de protéger votre serveur d'origine contre un accès direct. Référez-vous au guide pour plus de <a>instructions détaillées</a>.",
  session_duration: 'Durée de la session (jours)',
  try_it: 'Essayez',
  branding: {
    name: 'Marque',
    description:
      "Personnalisez le nom d'affichage et le logo de votre application sur l'écran de consentement.",
    more_info: "Plus d'informations",
    more_info_description:
      "Offrez aux utilisateurs plus de détails sur votre application sur l'écran de consentement.",
    display_name: "Nom d'affichage",
    display_logo: "Logo d'affichage",
    display_logo_dark: "Logo d'affichage (sombre)",
    terms_of_use_url: "URL des conditions d'utilisation de l'application",
    privacy_policy_url: "URL de la politique de confidentialité de l'application",
  },
  permissions: {
    name: 'Permissions',
    description:
      "Sélectionnez les permissions requises par l'application tierce pour l'autorisation de l'utilisateur afin d'accéder à des types de données spécifiques.",
    user_permissions: "Données personnelles de l'utilisateur",
    organization_permissions: "Accès à l'organisation",
    table_name: 'Accorder des permissions',
    field_name: 'Permission',
    field_description: "Affiché à l'écran de consentement",
    delete_text: 'Supprimer la permission',
    permissions_assignment_description:
      "Sélectionnez les permissions demandées par l'application tierce pour l'autorisation de l'utilisateur afin d'accéder à des types de données spécifiques.",
    user_profile: 'Données utilisateur',
    api_permissions: "Permissions d'API",
    organization: "Permissions d'organisation",
    user_permissions_assignment_form_title: 'Ajouter les permissions du profil utilisateur',
    organization_permissions_assignment_form_title: "Ajouter les permissions de l'organisation",
    api_resource_permissions_assignment_form_title: "Ajouter les permissions des ressources d'API",
    user_data_permission_description_tips:
      'Vous pouvez modifier la description des permissions relatives aux données personnelles des utilisateurs via "Expérience de connexion > Contenu > Gérer la langue"',
    permission_description_tips:
      "Lorsque Logto est utilisé comme fournisseur d'identités (IdP) pour l'authentification dans des applications tierces, et que les utilisateurs doivent donner leur autorisation, cette description apparaît sur l'écran de consentement.",
    user_title: 'Utilisateur',
    user_description:
      "Sélectionnez les permissions demandées par l'application tierce pour accéder à des données utilisateur spécifiques.",
    grant_user_level_permissions: 'Accorder des permissions des données utilisateur',
    organization_title: 'Organisation',
    organization_description:
      "Sélectionnez les permissions demandées par l'application tierce pour accéder à des données d'organisation spécifiques.",
    grant_organization_level_permissions: "Accorder des permissions des données d'organisation",
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

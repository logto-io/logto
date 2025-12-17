const application_details = {
  page_title: "Détails de l'application",
  back_to_applications: 'Retour aux applications',
  check_guide: 'Consulter le guide',
  settings: 'Paramètres',
  settings_description:
    "Une application est un logiciel ou un service enregistré pouvant accéder aux informations utilisateur ou agir pour un utilisateur. Les applications aident Logto à identifier qui demande quoi et gèrent la connexion ainsi que les autorisations. Remplissez les champs obligatoires pour l'authentification.",
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
  machine_logs: 'Journaux de machine',
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon App',
  description: 'Description',
  description_placeholder: 'Entrez la description de votre application',
  config_endpoint: 'Point de configuration du fournisseur OpenID',
  issuer_endpoint: 'Point de terminaison de l’émetteur',
  jwks_uri: 'URI JWKS',
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
  application_secret_other: 'Secrets de l’appli',
  redirect_uri: 'URI de redirection',
  redirect_uris: 'URIs de redirection',
  redirect_uri_placeholder: 'https://votre.site.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    "L'URI de redirection après la connexion d'un utilisateur (qu'elle soit réussie ou non). Voir OpenID Connect <a>AuthRequest</a> pour plus d'informations.",
  mixed_redirect_uri_warning:
    "Le type de votre application n'est pas compatible avec au moins une des URIs de redirection. Cela ne suit pas les meilleures pratiques et nous recommandons fortement de garder les URIs de redirection cohérentes.",
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
  rotate_refresh_token_label_for_public_clients:
    "Lorsqu'elle est activée, Logto émettra un nouveau token de rafraîchissement pour chaque demande de token. <a>En savoir plus</a>",
  backchannel_logout: 'Déconnexion en backchannel',
  backchannel_logout_description:
    'Configurez le point de terminaison de déconnexion en backchannel OpenID Connect et si une session est requise pour cette application.',
  backchannel_logout_uri: 'URI de déconnexion en backchannel',
  backchannel_logout_uri_session_required: 'La session est-elle requise ?',
  backchannel_logout_uri_session_required_description:
    "Lorsqu'elle est activée, le RP exige qu'une réclamation `sid` (ID de session) soit incluse dans le jeton de déconnexion pour identifier la session RP avec l'OP lorsque l'`URI de déconnexion en backchannel` est utilisé.",
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
  third_party_settings_description:
    "Intégrez des applications tierces avec Logto comme votre fournisseur d'identité (IdP) en utilisant OIDC / OAuth 2.0, avec un écran de consentement pour l'autorisation de l'utilisateur.",
  session_duration: 'Durée de la session (jours)',
  try_it: 'Essayez',
  no_organization_placeholder: 'Aucune organisation trouvée. <a>Aller aux organisations</a>',
  field_custom_data: 'Données personnalisées',
  field_custom_data_tip:
    'Informations supplémentaires personnalisées de l’application non listées dans les propriétés prédéfinies de l’application, telles que les paramètres et configurations spécifiques à l’entreprise.',
  custom_data_invalid: 'Les données personnalisées doivent être un objet JSON valide.',
  branding: {
    name: 'Marque',
    description:
      "Personnalisez le nom d'affichage et le logo de votre application sur l'écran de consentement.",
    description_third_party:
      "Personnalisez le nom d'affichage et le logo de votre application sur l'écran de consentement.",
    app_logo: 'Logo de l’application',
    app_level_sie: 'Expérience de connexion au niveau de l’application',
    app_level_sie_switch:
      'Activez l’expérience de connexion au niveau de l’application et configurez le branding spécifique à l’application. Si désactivée, l’expérience de connexion omni sera utilisée.',
    more_info: "Plus d'informations",
    more_info_description:
      "Offrez aux utilisateurs plus de détails sur votre application sur l'écran de consentement.",
    display_name: "Nom d'affichage",
    application_logo: 'Logo de l’application',
    application_logo_dark: 'Logo de l’application (sombre)',
    brand_color: 'Couleur de la marque',
    brand_color_dark: 'Couleur de la marque (sombre)',
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
    permission_delete_confirm:
      'Cette action retirera les autorisations accordées à l’application tierce, l’empêchant de demander l’autorisation de l’utilisateur pour des types de données spécifiques. Êtes-vous sûr de vouloir continuer ?',
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
    oidc_title: 'OIDC',
    oidc_description:
      'Les permissions OIDC de base sont configurées automatiquement pour votre application. Ces scopes sont essentiels à l’authentification et ne sont pas affichés sur l’écran de consentement de l’utilisateur.',
    default_oidc_permissions: 'Permissions OIDC par défaut',
    permission_column: 'Permission',
    guide_column: 'Guide',
    openid_permission: 'openid',
    openid_permission_guide:
      "Optionnel pour l’accès aux ressources OAuth.\nRequis pour l’authentification OIDC. Donne accès à un jeton d’identification (ID token) et permet d’accéder à 'userinfo_endpoint'.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'Optionnel. Récupère des jetons d’actualisation (refresh tokens) pour un accès de longue durée ou des tâches en arrière-plan.',
  },
  roles: {
    assign_button: 'Attribuer des rôles de machine à machine',
    delete_description:
      'Cette action supprimera ce rôle de cette application machine-to-machine. Le rôle lui-même existera toujours, mais il ne sera plus associé à cette application machine-to-machine.',
    deleted: '{{name}} a été supprimé(e) avec succès de cet utilisateur.',
    assign_title: 'Attribuer des rôles de machine à machine à {{name}}',
    assign_subtitle:
      'Les applications entre machines doivent avoir des rôles de type machine à machine pour accéder aux ressources API associées.',
    assign_role_field: 'Attribuer des rôles de machine à machine',
    role_search_placeholder: 'Rechercher par nom de rôle',
    added_text: '{{value, number}} ajouté(s)',
    assigned_app_count: '{{value, number}} applications',
    confirm_assign: 'Attribuer des rôles de machine à machine',
    role_assigned: 'Rôle(s) attribué(e)s avec succès',
    search: 'Rechercher par nom de rôle, description ou ID',
    empty: 'Aucun rôle disponible',
  },
  secrets: {
    value: 'Valeur',
    empty: "L'application n'a aucun secret.",
    created_at: 'Créé à',
    expires_at: 'Expire à',
    never: 'Jamais',
    create_new_secret: 'Créer un nouveau secret',
    delete_confirmation:
      'Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer ce secret ?',
    deleted: 'Le secret a été supprimé avec succès.',
    activated: 'Le secret a été activé avec succès.',
    deactivated: 'Le secret a été désactivé avec succès.',
    legacy_secret: 'Secret hérité',
    expired: 'Expiré',
    expired_tooltip: 'Ce secret a expiré le {{date}}.',
    create_modal: {
      title: "Créer un secret d'application",
      expiration: 'Expiration',
      expiration_description: 'Le secret expirera le {{date}}.',
      expiration_description_never:
        "Le secret n'expirera jamais. Nous recommandons de définir une date d'expiration pour une sécurité renforcée.",
      days: '{{count}} jour',
      days_other: '{{count}} jours',
      years: '{{count}} an',
      years_other: '{{count}} ans',
      created: 'Le secret {{name}} a été créé avec succès.',
    },
    edit_modal: {
      title: "Modifier le secret de l'application",
      edited: 'Le secret {{name}} a été modifié avec succès.',
    },
  },
  saml_idp_config: {
    title: 'Métadonnées SAML IdP',
    description:
      'Utilisez les métadonnées suivantes et le certificat pour configurer le SAML IdP dans votre application.',
    metadata_url_label: 'URL des métadonnées IdP',
    single_sign_on_service_url_label: 'URL du service de connexion unique',
    idp_entity_id_label: "ID d'entité IdP",
  },
  saml_idp_certificates: {
    title: 'Certificat de signature SAML',
    expires_at: 'Expire à',
    finger_print: 'Empreinte digitale',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
  },
  saml_idp_name_id_format: {
    title: "Format de l'ID de nom",
    description: "Sélectionnez le format d'ID de nom du SAML IdP.",
    persistent: 'Persistant',
    persistent_description: "Utilisez l'ID utilisateur Logto comme ID de nom",
    transient: 'Transitoire',
    transient_description: 'Utilisez un ID utilisateur unique comme ID de nom',
    unspecified: 'Non spécifié',
    unspecified_description: "Utilisez l'ID utilisateur Logto comme ID de nom",
    email_address: 'Adresse e-mail',
    email_address_description: "Utilisez l'adresse e-mail comme ID de nom",
  },
  saml_encryption_config: {
    encrypt_assertion: "Crypter l'assertion SAML",
    encrypt_assertion_description: "En activant cette option, l'assertion SAML sera cryptée.",
    encrypt_then_sign: 'Crypter puis signer',
    encrypt_then_sign_description:
      "En activant cette option, l'assertion SAML sera cryptée puis signée ; sinon, l'assertion SAML sera signée puis cryptée.",
    certificate: 'Certificat',
    certificate_tooltip:
      "Copiez et collez le certificat x509 que vous obtenez de votre fournisseur de services pour chiffrer l'assertion SAML.",
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'Le certificat est requis.',
    certificate_invalid_format_error:
      'Format de certificat invalide détecté. Veuillez vérifier le format du certificat et réessayer.',
  },
  saml_app_attribute_mapping: {
    name: 'Mappages des attributs',
    title: 'Mappages des attributs de base',
    description:
      "Ajoutez des mappages d'attributs pour synchroniser le profil utilisateur de Logto vers votre application.",
    col_logto_claims: 'Valeur de Logto',
    col_sp_claims: 'Nom de la valeur de votre application',
    add_button: 'Ajouter un autre',
  },
};

export default Object.freeze(application_details);

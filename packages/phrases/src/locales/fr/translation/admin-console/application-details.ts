const application_details = {
  page_title: 'Application details', // UNTRANSLATED
  back_to_applications: 'Retour aux applications',
  check_guide: 'Aller voir le guide',
  settings: 'Paramètres',
  settings_description:
    "Les applications sont utilisées pour identifier vos applications dans Logto pour OIDC, l'expérience de connexion, les journaux d'audit, etc.",
  advanced_settings: 'Paramètres avancés',
  advanced_settings_description:
    "Les paramètres avancés comprennent des termes liés à OIDC. Vous pouvez consulter le point de terminaison de jeton pour plus d'informations.",
  application_name: "Nom de l'application",
  application_name_placeholder: 'Mon App',
  description: 'Description',
  description_placeholder: 'Entrez la description de votre application',
  authorization_endpoint: "Point de terminaison d'autorisation",
  authorization_endpoint_tip:
    "Le point de terminaison pour effectuer l'authentification et l'autorisation. Il est utilisé pour <a>l'authentification</a> OpenID Connect.",
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
  id_token_expiration: "Expiration de l'ID du jeton",
  refresh_token_expiration: 'Expiration de rafraîchissement du jeton',
  token_endpoint: "Point d'extrémité du jeton",
  user_info_endpoint: "Point d'extrémité Utilisateur",
  enable_admin_access: "Activer l'accès administrateur",
  enable_admin_access_label:
    "Activer ou désactiver l'accès à l'API de gestion. Une fois activé, vous pouvez utiliser des jetons d'accès pour appeler l'API de gestion au nom de cette application.",
  delete_description:
    "Cette action ne peut être annulée. Elle supprimera définitivement l'application. Veuillez entrer le nom de l'application <span>{{nom}}</span> pour confirmer.",
  enter_your_application_name: 'Entrez le nom de votre application',
  application_deleted: "L'application {{name}} a été supprimée avec succès.",
  redirect_uri_required: 'Vous devez entrer au moins un URI de redirection.',
};

export default application_details;

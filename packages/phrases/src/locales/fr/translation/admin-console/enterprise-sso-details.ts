const enterprise_sso_details = {
  back_to_sso_connectors: "Retourner aux connecteurs SSO d'entreprise",
  page_title: "Détails du connecteur SSO d'entreprise",
  readme_drawer_title: "SSO d'entreprise",
  readme_drawer_subtitle:
    "Configurez des connecteurs SSO d'entreprise pour permettre la connexion unique des utilisateurs finaux",
  tab_experience: 'Expérience SSO',
  tab_connection: 'Connexion',
  tab_idp_initiated_auth: 'SSO initié par IdP',
  general_settings_title: 'Général',
  general_settings_description:
    "Configurez l'expérience utilisateur final et liez le domaine email d'entreprise pour un flux SSO initié par le SP.",
  custom_branding_title: 'Affichage',
  custom_branding_description:
    "Personnalisez le nom et le logo affichés dans le flux de connexion unique des utilisateurs finaux. Lorsqu'ils sont vides, les valeurs par défaut sont utilisées.",
  email_domain_field_name: "Domaine de courrier électronique d'entreprise",
  email_domain_field_description:
    "Les utilisateurs de ce domaine de courrier électronique peuvent utiliser SSO pour l'authentification. Veuillez vérifier que le domaine appartient à l'entreprise.",
  email_domain_field_placeholder: 'Domaine de courrier électronique',
  sync_profile_field_name:
    "Synchroniser les informations du profil à partir du fournisseur d'identité",
  sync_profile_option: {
    register_only: "Ne synchroniser qu'à la première connexion",
    each_sign_in: 'Synchroniser toujours à chaque connexion',
  },
  connector_name_field_name: 'Nom du connecteur',
  display_name_field_name: "Nom d'affichage",
  connector_logo_field_name: "Logo d'affichage",
  connector_logo_field_description:
    'Chaque image doit faire moins de 500 Ko, format SVG, PNG, JPG, JPEG uniquement.',
  branding_logo_context: 'Télécharger le logo',
  branding_logo_error: 'Erreur de téléversement de logo : {{error}}',
  branding_light_logo_context: 'Télécharger le logo pour le mode clair',
  branding_light_logo_error: 'Erreur de téléversement de logo pour le mode clair : {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://votre.domaine/logo.png',
  branding_dark_logo_context: 'Télécharger le logo pour le mode sombre',
  branding_dark_logo_error: 'Erreur de téléversement de logo pour le mode sombre : {{error}}',
  branding_dark_logo_field_name: 'Logo (mode sombre)',
  branding_dark_logo_field_placeholder: 'https://votre.domaine/logo-mode-sombre.png',
  check_connection_guide: 'Guide de connexion',
  enterprise_sso_deleted: "Le connecteur SSO d'entreprise a été supprimé avec succès",
  delete_confirm_modal_title: "Supprimer le connecteur SSO d'entreprise",
  delete_confirm_modal_content:
    "Êtes-vous sûr de vouloir supprimer ce connecteur d'entreprise ? Les utilisateurs des fournisseurs d'identité n'utiliseront pas la connexion unique.",
  upload_idp_metadata_title_saml: 'Téléverser les métadonnées',
  upload_idp_metadata_description_saml:
    "Configurez les métadonnées copiées du fournisseur d'identité.",
  upload_idp_metadata_title_oidc: "Téléverser les informations d'identification",
  upload_idp_metadata_description_oidc:
    "Configurez les informations d'identification et le jeton OIDC copié du fournisseur d'identité.",
  upload_idp_metadata_button_text: 'Téléverser le fichier XML de métadonnées',
  upload_signing_certificate_button_text: 'Téléverser le fichier de certificat de signature',
  configure_domain_field_info_text:
    "Ajoutez un domaine de courrier électronique pour guider les utilisateurs d'entreprise vers leur fournisseur d'identité pour la connexion unique.",
  email_domain_field_required:
    "Le domaine de messagerie électronique est requis pour activer le SSO d'entreprise.",
  upload_saml_idp_metadata_info_text_url:
    "Collez l'URL des métadonnées du fournisseur d'identité pour vous connecter.",
  upload_saml_idp_metadata_info_text_xml:
    "Collez les métadonnées du fournisseur d'identité pour vous connecter.",
  upload_saml_idp_metadata_info_text_manual:
    "Remplissez les métadonnées du fournisseur d'identité pour vous connecter.",
  upload_oidc_idp_info_text:
    "Remplissez les informations du fournisseur d'identité pour vous connecter.",
  service_provider_property_title: "Configurer dans l'IdP",
  service_provider_property_description:
    "Configurez une intégration d'application utilisant {{protocol}} dans votre fournisseur d'identité. Entrez les détails fournis par Logto.",
  attribute_mapping_title: "Correspondances d'attributs",
  attribute_mapping_description:
    "Synchronisez les profils des utilisateurs à partir du fournisseur d'identité en configurant la correspondance des attributs d'utilisateur soit sur le fournisseur d'identité soit du côté de Logto.",
  saml_preview: {
    sign_on_url: 'URL de connexion',
    entity_id: 'Émetteur',
    x509_certificate: 'Certificat de signature',
    certificate_content: 'Expiration {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: "Point de terminaison d'autorisation",
    token_endpoint: 'Point de terminaison du jeton',
    userinfo_endpoint: 'Point de terminaison des informations utilisateur',
    jwks_uri: "Point de terminaison de l'ensemble de clés JSON web",
    issuer: 'Émetteur',
  },
  idp_initiated_auth_config: {
    card_title: 'SSO initié par IdP',
    card_description:
      "L'utilisateur démarre généralement le processus d'authentification depuis votre application à l'aide du flux SSO initié par SP. NE PAS activer cette fonctionnalité sauf si absolument nécessaire.",
    enable_idp_initiated_sso: 'Activer le SSO initié par IdP',
    enable_idp_initiated_sso_description:
      "Permettre aux utilisateurs d'entreprise de démarrer le processus d'authentification directement depuis le portail du fournisseur d'identité. Veuillez comprendre les risques potentiels pour la sécurité avant d'activer cette fonctionnalité.",
    default_application: 'Application par défaut',
    default_application_tooltip:
      "Application cible vers laquelle l'utilisateur sera redirigé après authentification.",
    empty_applications_error:
      'Aucune application trouvée. Veuillez en ajouter une dans la section <a>Applications</a>.',
    empty_applications_placeholder: 'Aucune application',
    authentication_type: "Type d'authentification",
    auto_authentication_disabled_title: 'Rediriger vers le client pour SSO initié par SP',
    auto_authentication_disabled_description:
      "Recommandé. Redirigez les utilisateurs vers l'application côté client pour initier une authentification OIDC sécurisée initiée par SP. Cela évitera les attaques CSRF.",
    auto_authentication_enabled_title: "Connexion directe à l'aide du SSO initié par IdP",
    auto_authentication_enabled_description:
      "Après une connexion réussie, les utilisateurs seront redirigés vers l'URI de redirection spécifiée avec le code d'autorisation (sans validation de l'état et de PKCE).",
    auto_authentication_disabled_app:
      "Pour l'application web traditionnelle, application monopage (SPA)",
    auto_authentication_enabled_app: "Pour l'application web traditionnelle",
    idp_initiated_auth_callback_uri: 'URI de rappel du client',
    idp_initiated_auth_callback_uri_tooltip:
      "L'URI de rappel du client pour initier un flux d'authentification SSO initié par SP. Un ssoConnectorId sera ajouté à l'URI en tant que paramètre de requête. (ex. : https://your.domain/sso/callback?connectorId={{ssoConnectorId}})",
    redirect_uri: 'URI de redirection post-connexion',
    redirect_uri_tooltip:
      "L'URI de redirection pour rediriger les utilisateurs après une connexion réussie. Logto utilisera cette URI comme URI de redirection OIDC dans la demande d'autorisation. Utilisez une URI dédiée pour le flux d'authentification SSO initié par IdP pour une meilleure sécurité.",
    empty_redirect_uris_error:
      "Aucune URI de redirection n'a été enregistrée pour l'application. Veuillez en ajouter une d'abord.",
    redirect_uri_placeholder: 'Sélectionner une URI de redirection post-connexion',
    auth_params: "Paramètres d'authentification supplémentaires",
    auth_params_tooltip:
      'Paramètres supplémentaires à transmettre dans la demande d\'autorisation. Par défaut, seules les portées (openid profile) seront demandées, vous pouvez spécifier ici des portées supplémentaires ou une valeur d\'état exclusive. (ex. : { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Faire confiance aux courriels non vérifiés',
  trust_unverified_email_label:
    "Faire toujours confiance aux adresses courriel non vérifiées renvoyées par le fournisseur d'identité",
  trust_unverified_email_tip:
    "Le connecteur Entra ID (OIDC) ne retourne pas la revendication `email_verified`, ce qui signifie que les adresses électroniques d'Azure ne sont pas garanties comme étant vérifiées. Par défaut, Logto ne synchronisera pas les adresses email non vérifiées vers le profil utilisateur. Activez cette option uniquement si vous faites confiance à toutes les adresses email du répertoire Entra ID.",
  offline_access: {
    label: "Actualiser le jeton d'accès",
    description:
      "Activer l'accès `offline` de Google pour demander un jeton d'actualisation, permettant à votre application d'actualiser le jeton d'accès sans nouvelle autorisation de l'utilisateur.",
  },
};

export default Object.freeze(enterprise_sso_details);

const enterprise_sso_details = {
  back_to_sso_connectors: "Retour aux connecteurs SSO d'entreprise",
  page_title: "Détails du connecteur SSO d'entreprise",
  readme_drawer_title: "SSO d'entreprise",
  readme_drawer_subtitle:
    "Configurer les connecteurs SSO d'entreprise pour permettre un SSO pour les utilisateurs finaux",
  tab_settings: 'Paramètres',
  tab_connection: 'Connexion',
  general_settings_title: 'Paramètres généraux',
  custom_branding_title: 'Personnalisation de la marque',
  custom_branding_description:
    "Personnalisez les informations d'affichage de l'IdP d'entreprise pour le bouton de connexion et d'autres scénarios.",
  email_domain_field_name: "Domaine de messagerie de l'entreprise",
  email_domain_field_description:
    "Les utilisateurs avec ce domaine de messagerie peuvent utiliser le SSO pour l'authentification. Veuillez vous assurer que le domaine appartient à l'entreprise.",
  email_domain_field_placeholder: 'Domaine de messagerie',
  sync_profile_field_name:
    "Synchroniser les informations de profil depuis le fournisseur d'identité",
  sync_profile_option: {
    register_only: 'Synchroniser uniquement lors de la première connexion',
    each_sign_in: 'Synchroniser toujours à chaque connexion',
  },
  connector_name_field_name: 'Nom du connecteur',
  connector_logo_field_name: 'Logo du connecteur',
  branding_logo_context: 'Télécharger le logo',
  branding_logo_error: 'Erreur de téléchargement du logo : {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://votre.domaine/logo.png',
  branding_dark_logo_context: 'Télécharger le logo en mode sombre',
  branding_dark_logo_error: 'Erreur de téléchargement du logo en mode sombre : {{error}}',
  branding_dark_logo_field_name: 'Logo (mode sombre)',
  branding_dark_logo_field_placeholder: 'https://votre.domaine/dark-mode-logo.png',
  check_readme: 'Vérifier le README',
  enterprise_sso_deleted: "Le connecteur SSO d'entreprise a été supprimé avec succès",
  delete_confirm_modal_title: "Supprimer le connecteur SSO d'entreprise",
  delete_confirm_modal_content:
    "Êtes-vous sûr de vouloir supprimer ce connecteur d'entreprise ? Les utilisateurs des fournisseurs d'identité ne pourront pas utiliser la connexion unique (SSO).",
  upload_idp_metadata_title: 'Télécharger les métadonnées IdP',
  upload_idp_metadata_description:
    "Configurer les métadonnées copiées depuis le fournisseur d'identité.",
  upload_saml_idp_metadata_info_text_url:
    "Collez l'URL des métadonnées du fournisseur d'identité pour vous connecter.",
  upload_saml_idp_metadata_info_text_xml:
    "Collez les métadonnées du fournisseur d'identité pour vous connecter.",
  upload_saml_idp_metadata_info_text_manual:
    "Remplissez les métadonnées du fournisseur d'identité pour vous connecter.",
  upload_oidc_idp_info_text:
    "Remplissez les informations du fournisseur d'identité pour vous connecter.",
  service_provider_property_title: "Configurez votre service dans l'IdP",
  service_provider_property_description:
    "Créez une nouvelle intégration d'application par {{protocol}} dans votre {{name}}. Ensuite, collez les détails du fournisseur de services suivants pour configurer {{protocol}}.",
  attribute_mapping_title: "Mappage d'attributs",
  attribute_mapping_description:
    "L'`id` et l'`email` de l'utilisateur sont requis pour synchroniser le profil utilisateur à partir de l'IdP. Entrez le nom et la valeur suivants dans {{name}}.",
  saml_preview: {
    sign_on_url: 'URL de connexion',
    entity_id: 'Émetteur',
    x509_certificate: 'Certificat de signature',
  },
  oidc_preview: {
    authorization_endpoint: "Point de terminaison d'autorisation",
    token_endpoint: 'Point de terminaison de jeton',
    userinfo_endpoint: "Point de terminaison d'informations utilisateur",
    jwks_uri: "Point de terminaison d'ensemble de clés Web JSON",
    issuer: 'Émetteur',
  },
};

export default Object.freeze(enterprise_sso_details);

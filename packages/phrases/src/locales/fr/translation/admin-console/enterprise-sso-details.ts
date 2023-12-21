const enterprise_sso_details = {
  back_to_sso_connectors: "Retourner aux connecteurs SSO d'entreprise",
  page_title: "Détails du connecteur SSO d'entreprise",
  readme_drawer_title: "SSO d'entreprise",
  readme_drawer_subtitle:
    "Configurez des connecteurs SSO d'entreprise pour permettre la connexion unique des utilisateurs finaux",
  tab_experience: 'Expérience SSO',
  tab_connection: 'Connexion',
  general_settings_title: 'Général',
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
};

export default Object.freeze(enterprise_sso_details);

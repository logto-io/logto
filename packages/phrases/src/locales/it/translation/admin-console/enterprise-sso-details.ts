const enterprise_sso_details = {
  back_to_sso_connectors: 'Torna ai connettori SSO aziendali',
  page_title: 'Dettagli del connettore SSO aziendale',
  readme_drawer_title: 'SSO aziendale',
  readme_drawer_subtitle:
    "Configura i connettori SSO aziendali per abilitare l'SSO degli utenti finali",
  tab_experience: 'Esperienza SSO',
  tab_connection: 'Connessione',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: 'Generale',
  custom_branding_title: 'Display',
  custom_branding_description:
    'Personalizza il nome e il logo visualizzati nel flusso di accesso Single Sign-On degli utenti finali. Quando vuoto, vengono utilizzati i valori predefiniti.',
  email_domain_field_name: 'Dominio email aziendale',
  email_domain_field_description:
    "Gli utenti con questo dominio email possono utilizzare l'SSO per l'autenticazione. Verifica che il dominio appartenga all'azienda.",
  email_domain_field_placeholder: 'Dominio email',
  sync_profile_field_name: 'Sincronizza le informazioni del profilo dal fornitore di identità',
  sync_profile_option: {
    register_only: 'Sincronizza solo al primo accesso',
    each_sign_in: 'Sincronizza sempre ad ogni accesso',
  },
  connector_name_field_name: 'Nome connettore',
  display_name_field_name: 'Nome visualizzato',
  connector_logo_field_name: 'Logo visualizzato',
  connector_logo_field_description:
    'Ogni immagine deve essere inferiore a 500 KB, solo SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Carica logo',
  branding_logo_error: 'Errore caricamento logo: {{error}}',
  branding_light_logo_context: 'Carica logo modalità chiara',
  branding_light_logo_error: 'Errore caricamento logo modalità chiara: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://tuo.domino/logo.png',
  branding_dark_logo_context: 'Carica logo modalità scura',
  branding_dark_logo_error: 'Errore caricamento logo modalità scura: {{error}}',
  branding_dark_logo_field_name: 'Logo (modalità scura)',
  branding_dark_logo_field_placeholder: 'https://tuo.domino/logo-modalita-scura.png',
  check_connection_guide: 'Guida alla connessione',
  enterprise_sso_deleted: 'Il connettore SSO aziendale è stato eliminato con successo',
  delete_confirm_modal_title: 'Elimina connettore SSO aziendale',
  delete_confirm_modal_content:
    'Sei sicuro di voler eliminare questo connettore aziendale? Gli utenti dai fornitori di identità non utilizzeranno il Single Sign-On.',
  upload_idp_metadata_title_saml: 'Carica i metadati',
  upload_idp_metadata_description_saml: 'Configura i metadati copiati dal fornitore di identità.',
  upload_idp_metadata_title_oidc: 'Carica le credenziali',
  upload_idp_metadata_description_oidc:
    'Configura le credenziali e le informazioni sul token OIDC copiate dal fornitore di identità.',
  upload_idp_metadata_button_text: 'Carica file XML di metadati',
  upload_signing_certificate_button_text: 'Carica file del certificato di firma',
  configure_domain_field_info_text:
    'Aggiungi il dominio email per guidare gli utenti aziendali al loro fornitore di identità per il Single Sign-On.',
  email_domain_field_required: "Il dominio email è obbligatorio per abilitare l'SSO aziendale.",
  upload_saml_idp_metadata_info_text_url:
    "Incolla l'URL dei metadati dal fornitore di identità per collegare.",
  upload_saml_idp_metadata_info_text_xml:
    'Incolla i metadati dal fornitore di identità per collegare.',
  upload_saml_idp_metadata_info_text_manual:
    'Compila i metadati dal fornitore di identità per collegare.',
  upload_oidc_idp_info_text: 'Compila le informazioni dal fornitore di identità per collegare.',
  service_provider_property_title: "Configura nell'IdP",
  service_provider_property_description:
    "Configura un'integrazione dell'applicazione utilizzando {{protocol}} nel tuo fornitore di identità. Inserisci i dettagli forniti da Logto.",
  attribute_mapping_title: 'Mappatura attributi',
  attribute_mapping_description:
    'Sincronizza i profili degli utenti dal fornitore di identità configurando la mappatura degli attributi degli utenti sul lato identità o sul lato di Logto.',
  saml_preview: {
    sign_on_url: 'URL di accesso',
    entity_id: 'Emittente',
    x509_certificate: 'Certificato di firma',
    certificate_content: 'Scadenza {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Punto di autorizzazione',
    token_endpoint: 'Punto di token',
    userinfo_endpoint: 'Punto di informazioni utente',
    jwks_uri: 'Punto finale del set di chiavi JSON web',
    issuer: 'Emittente',
  },
  idp_initiated_auth_config: {
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);

const enterprise_sso_details = {
  back_to_sso_connectors: 'Torna ai connettori SSO aziendali',
  page_title: 'Dettagli del connettore SSO aziendale',
  readme_drawer_title: 'SSO aziendale',
  readme_drawer_subtitle:
    "Configura i connettori SSO aziendali per abilitare l'SSO degli utenti finali",
  tab_experience: 'Esperienza SSO',
  tab_connection: 'Connessione',
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
};

export default Object.freeze(enterprise_sso_details);

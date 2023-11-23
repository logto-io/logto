const enterprise_sso_details = {
  back_to_sso_connectors: 'Torna ai connector SSO enterprise',
  page_title: 'Dettagli del connettore SSO enterprise',
  readme_drawer_title: 'SSO enterprise',
  readme_drawer_subtitle:
    "Configura i connector SSO enterprise per abilitare l'SSO degli utenti finali",
  tab_settings: 'Impostazioni',
  tab_connection: 'Connessione',
  general_settings_title: 'Impostazioni generali',
  custom_branding_title: 'Personalizzazione del marchio',
  custom_branding_description:
    'Personalizza le informazioni di visualizzazione del provider di identità aziendale per il pulsante di accesso e altri scenari.',
  email_domain_field_name: 'Dominio email aziendale',
  email_domain_field_description:
    "Gli utenti con questo dominio email possono utilizzare l'SSO per l'autenticazione. Assicurati che il dominio appartenga all'azienda.",
  email_domain_field_placeholder: 'Dominio email',
  sync_profile_field_name: 'Sincronizza le informazioni del profilo dal provider di identità',
  sync_profile_option: {
    register_only: 'Sincronizza solo al primo accesso',
    each_sign_in: 'Sincronizza sempre ad ogni accesso',
  },
  connector_name_field_name: 'Nome del connettore',
  connector_logo_field_name: 'Logo del connettore',
  branding_logo_context: 'Carica logo',
  branding_logo_error: 'Errore di caricamento logo: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://tuo.dominio/logo.png',
  branding_dark_logo_context: 'Carica logo modalità scura',
  branding_dark_logo_error: 'Errore di caricamento logo modalità scura: {{error}}',
  branding_dark_logo_field_name: 'Logo (modalità scura)',
  branding_dark_logo_field_placeholder: 'https://tuo.dominio/logo-modalità-scura.png',
  check_readme: 'Controlla README',
  enterprise_sso_deleted: 'Il connettore SSO enterprise è stato eliminato con successo',
  delete_confirm_modal_title: 'Elimina il connettore SSO enterprise',
  delete_confirm_modal_content:
    'Sei sicuro di voler eliminare questo connettore aziendale? Gli utenti dai provider di identità non utilizzeranno il Single Sign-On.',
  upload_idp_metadata_title: 'Carica metadati IdP',
  upload_idp_metadata_description: 'Configura i metadati copiati dal provider di identità.',
  upload_saml_idp_metadata_info_text_url:
    "Incolla l'URL dei metadati del provider di identità per collegare.",
  upload_saml_idp_metadata_info_text_xml:
    'Incolla i metadati dal provider di identità per collegare.',
  upload_saml_idp_metadata_info_text_manual:
    'Compila i metadati dal provider di identità per collegare.',
  upload_oidc_idp_info_text: 'Compila le informazioni dal provider di identità per collegare.',
  service_provider_property_title: "Configura il tuo servizio nell'IdP",
  service_provider_property_description:
    "Crea una nuova integrazione dell'app tramite {{protocol}} nel tuo {{name}}. Quindi incolla i seguenti dettagli del fornitore di servizi per configurare {{protocol}}.",
  attribute_mapping_title: 'Mappatura attributi',
  attribute_mapping_description:
    "L'ID e l'email dell'utente sono richiesti per sincronizzare il profilo utente da IdP. Inserisci il seguente nome e valore in {{name}}.",
  saml_preview: {
    sign_on_url: 'URL di accesso',
    entity_id: 'Emittente',
    x509_certificate: 'Certificato di firma',
  },
  oidc_preview: {
    authorization_endpoint: 'Endpoint di autorizzazione',
    token_endpoint: 'Endpoint del token',
    userinfo_endpoint: "Endpoint delle informazioni sull'utente",
    jwks_uri: 'Endpoint del set di chiavi JSON web',
    issuer: 'Emettitore',
  },
};

export default Object.freeze(enterprise_sso_details);

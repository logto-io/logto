const enterprise_sso_details = {
  back_to_sso_connectors: 'Torna ai connettori SSO aziendali',
  page_title: 'Dettagli del connettore SSO aziendale',
  readme_drawer_title: 'SSO aziendale',
  readme_drawer_subtitle:
    "Configura i connettori SSO aziendali per abilitare l'SSO degli utenti finali",
  tab_experience: 'Esperienza SSO',
  tab_connection: 'Connessione',
  tab_idp_initiated_auth: "SSO avviato dall'IdP",
  general_settings_title: 'Generale',
  general_settings_description:
    "Configura l'esperienza dell'utente finale e collega il dominio email aziendale per il flusso SSO avviato dal SP.",
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
    card_title: "SSO avviato dall'IdP",
    card_description:
      'Gli utenti di solito iniziano il processo di autenticazione dalla tua app utilizzando il flusso SSO avviato dal SP. NON abilitare questa funzione a meno che non sia assolutamente necessario.',
    enable_idp_initiated_sso: "Abilita l'SSO avviato dall'IdP",
    enable_idp_initiated_sso_description:
      'Consenti agli utenti aziendali di avviare il processo di autenticazione direttamente dal portale del fornitore di identità. Si prega di comprendere i potenziali rischi per la sicurezza prima di abilitare questa funzione.',
    default_application: 'Applicazione predefinita',
    default_application_tooltip:
      "Applicazione di destinazione alla quale l'utente sarà reindirizzato dopo l'autenticazione.",
    empty_applications_error:
      'Nessuna applicazione trovata. Si prega di aggiungerne una nella sezione <a>Applicazioni</a>.',
    empty_applications_placeholder: 'Nessuna applicazione',
    authentication_type: 'Tipo di autenticazione',
    auto_authentication_disabled_title: "Reindirizza al client per l'SSO avviato dal SP",
    auto_authentication_disabled_description:
      "Raccomandato. Reindirizza gli utenti all'applicazione client-side per avviare un'autenticazione OIDC avviata dal SP sicura. Questo preverrà gli attacchi CSRF.",
    auto_authentication_enabled_title: "Accedi direttamente utilizzando l'SSO avviato dall'IdP",
    auto_authentication_enabled_description:
      "Dopo l'accesso riuscito, gli utenti saranno reindirizzati all'URI di reindirizzamento specificato con il codice di autorizzazione (Senza convalida dello stato e del PKCE).",
    auto_authentication_disabled_app:
      'Per app web tradizionale, applicazione a pagina singola (SPA)',
    auto_authentication_enabled_app: 'Per app web tradizionale',
    idp_initiated_auth_callback_uri: 'URI di callback del client',
    idp_initiated_auth_callback_uri_tooltip:
      "L'URI di callback del client per avviare un flusso di autenticazione SSO avviato dal SP. Un ssoConnectorId verrà aggiunto come parametro query all'URI. (es., https://tuo.domino/sso/callback?connectorId={{ssoConnectorId}})",
    redirect_uri: 'URI di reindirizzamento post-accesso',
    redirect_uri_tooltip:
      "L'URI di reindirizzamento per reindirizzare gli utenti dopo l'accesso riuscito. Logto utilizzerà questo URI come URI di reindirizzamento OIDC nella richiesta di autorizzazione. Utilizza un URI dedicato per il flusso di autenticazione SSO avviato dall'IdP per una maggiore sicurezza.",
    empty_redirect_uris_error:
      "Nessun URI di reindirizzamento è stato registrato per l'applicazione. Si prega di aggiungerne uno per primo.",
    redirect_uri_placeholder: 'Seleziona un URI di reindirizzamento post-accesso',
    auth_params: 'Parametri di autenticazione aggiuntivi',
    auth_params_tooltip:
      'Parametri aggiuntivi da passare nella richiesta di autorizzazione. Per impostazione predefinita verranno richiesti solo gli ambiti (openid profile), puoi specificare ambiti aggiuntivi o un valore di stato esclusivo qui. (es., { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: "Considera attendibile l'email non verificata",
  trust_unverified_email_label:
    'Considera sempre attendibili gli indirizzi email non verificati restituiti dal fornitore di identità',
  trust_unverified_email_tip:
    'Il connettore Entra ID (OIDC) non restituisce il claim `email_verified`, il che significa che gli indirizzi email di Azure non sono garantiti come verificati. Per impostazione predefinita, Logto non sincronizzerà gli indirizzi email non verificati nel profilo utente. Abilita questa opzione solo se consideri attendibili tutti gli indirizzi email dal directory Entra ID.',
  offline_access: {
    label: 'Aggiorna il token di accesso',
    description:
      "Consenti l'accesso `offline` a Google per richiedere un token di aggiornamento, permettendo alla tua app di aggiornare il token di accesso senza la riautorizzazione da parte dell'utente.",
  },
};

export default Object.freeze(enterprise_sso_details);

const enterprise_sso = {
  page_title: 'SSO aziendale',
  title: 'SSO aziendale',
  subtitle: 'Collega il provider di identità aziendale e abilita il Single Sign-On.',
  create: 'Aggiungi connettore aziendale',
  col_connector_name: 'Nome connettore',
  col_type: 'Tipo',
  col_email_domain: 'Dominio email',
  placeholder_title: 'Connettore aziendale',
  placeholder_description:
    'Logto ha fornito molti provider di identità aziendale incorporati per connettersi, nel frattempo puoi creare il tuo con i protocolli SAML e OIDC.',
  create_modal: {
    title: 'Aggiungi connettore aziendale',
    text_divider: 'Oppure puoi personalizzare il tuo connettore con un protocollo standard.',
    connector_name_field_title: 'Nome connettore',
    connector_name_field_placeholder: 'E.g., {corp. name} - {identity provider name}',
    create_button_text: 'Crea connettore',
  },
  guide: {
    subtitle: 'Una guida passo passo per connettere il provider di identità aziendale.',
    finish_button_text: 'Continua',
  },
  basic_info: {
    title: "Configura il tuo servizio nell'IdP",
    description:
      "Crea una nuova integrazione dell'applicazione tramite SAML 2.0 nel tuo provider di identità {{name}}. Quindi incolla il valore seguente.",
    saml: {
      acs_url_field_name: 'URL del servizio consumer di asserzioni (URL di risposta)',
      audience_uri_field_name: 'URI del pubblico (ID entità SP)',
      entity_id_field_name: 'ID entità del fornitore di servizi (SP)',
      entity_id_field_tooltip:
        "L'ID entità SP può essere in qualsiasi formato di stringa, solitamente utilizzando una forma URI o una forma URL come identificatore, ma non è obbligatorio.",
      acs_url_field_placeholder: 'https://your-domain.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:your-domain.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'URI di reindirizzamento (URL di callback)',
      redirect_uri_field_description:
        "L'URI di reindirizzamento è dove gli utenti vengono reindirizzati dopo l'autenticazione SSO. Aggiungi questa URI alla configurazione del tuo IdP.",
      redirect_uri_field_custom_domain_description:
        "Se utilizzi più <a>domini personalizzati</a> in Logto, assicurati di aggiungere tutte le rispettive URI di callback al tuo IdP per far funzionare l'SSO su ogni dominio.\n\nIl dominio predefinito di Logto (*.logto.app) è sempre valido: includilo solo se desideri supportare l'SSO anche su quel dominio.",
    },
  },
  attribute_mapping: {
    title: 'Mappatura degli attributi',
    description:
      '`id` e `email` sono necessari per sincronizzare il profilo utente da IdP. Immetti il nome del claim e il valore seguenti nel tuo IdP.',
    col_sp_claims: 'Valore del fornitore di servizi (Logto)',
    col_idp_claims: 'Nome del claim del provider di identità',
    idp_claim_tooltip: 'Il nome del claim del provider di identità',
  },
  metadata: {
    title: 'Configura i metadati IdP',
    description: 'Configura i metadati dal provider di identità',
    dropdown_trigger_text: 'Utilizza un altro metodo di configurazione',
    dropdown_title: 'seleziona il tuo metodo di configurazione',
    metadata_format_url: "Inserisci l'URL dei metadati",
    metadata_format_xml: 'Carica il file XML dei metadati',
    metadata_format_manual: 'Inserisci manualmente i dettagli dei metadati',
    saml: {
      metadata_url_field_name: 'URL dei metadati',
      metadata_url_description:
        "Recupera dinamicamente i dati dall'URL dei metadati e mantieni aggiornato il certificato.",
      metadata_xml_field_name: 'File XML dei metadati IdP',
      metadata_xml_uploader_text: 'Carica il file XML dei metadati',
      sign_in_endpoint_field_name: 'URL di accesso',
      idp_entity_id_field_name: 'ID entità IdP (Emittente)',
      certificate_field_name: 'Certificato di firma',
      certificate_placeholder: 'Copia e incolla il certificato x509',
      certificate_required: 'Il certificato di firma è richiesto.',
    },
    oidc: {
      client_id_field_name: 'ID client',
      client_secret_field_name: 'Segreto del client',
      issuer_field_name: 'Emittente',
      scope_field_name: 'Ambito',
      scope_field_placeholder: 'Inserisci gli scopi (separati da uno spazio)',
    },
  },
};

export default Object.freeze(enterprise_sso);

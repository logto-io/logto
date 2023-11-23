const enterprise_sso = {
  page_title: 'SSO aziendale',
  title: 'SSO aziendale',
  subtitle:
    "Collega il provider di identità aziendale e abilita l'accesso unico inizializzato dal fornitore di servizi.",
  create: 'Aggiungi connettore aziendale',
  col_connector_name: 'Nome connettore',
  col_type: 'Tipo',
  col_email_domain: 'Dominio email',
  col_status: 'Stato',
  col_status_in_use: 'In uso',
  col_status_invalid: 'Non valido',
  placeholder_title: 'Connettore aziendale',
  placeholder_description:
    'Logto ha fornito numerosi provider di identità aziendale integrati, nel frattempo puoi creare il tuo con protocolli standard.',
  create_modal: {
    title: 'Aggiungi connettore aziendale',
    text_divider: 'Oppure puoi personalizzare il tuo connettore con un protocollo standard.',
    connector_name_field_title: 'Nome connettore',
    connector_name_field_placeholder: 'Nome del provider di identità aziendale',
    create_button_text: 'Crea connettore',
  },
  guide: {
    subtitle: 'Una guida passo-passo per collegare il provider di identità aziendale.',
    finish_button_text: 'Continua',
  },
  basic_info: {
    title: "Configura il tuo servizio nell'IdP",
    description:
      "Crea una nuova integrazione dell'applicazione tramite SAML 2.0 nel tuo provider di identità {{name}}. Quindi incolla il seguente valore.",
    saml: {
      acs_url_field_name: 'URL del servizio di consumo degli Assert (URL di risposta)',
      audience_uri_field_name: 'URI Audience (SP Entity ID)',
    },
    oidc: {
      redirect_uri_field_name: 'URI di reindirizzamento (URL di callback)',
    },
  },
  attribute_mapping: {
    title: 'Mappatura attributi',
    description:
      "`id` e `email` sono necessari per sincronizzare il profilo dell'utente da IdP. Inserisci il seguente nome rivendicazione e valore nel tuo IdP.",
    col_sp_claims: 'Nome rivendicazione di Logto',
    col_idp_claims: 'Nome rivendicazione del provider di identità',
    idp_claim_tooltip: 'Il nome rivendicazione del provider di identità',
  },
  metadata: {
    title: "Configura i metadati dell'IdP",
    description: 'Configura i metadati dal provider di identità',
    dropdown_trigger_text: 'Usa un altro metodo di configurazione',
    dropdown_title: 'seleziona il tuo metodo di configurazione',
    metadata_format_url: "Inserisci l'URL dei metadati",
    metadata_format_xml: 'Carica il file XML dei metadati',
    metadata_format_manual: 'Inserisci manualmente i dettagli dei metadati',
    saml: {
      metadata_url_field_name: 'URL dei metadati',
      metadata_url_description:
        "Recupera dinamicamente i dati dall'URL dei metadati e mantieni aggiornato il certificato.",
      metadata_xml_field_name: 'File XML dei metadati',
      metadata_xml_uploader_text: 'Carica il file XML dei metadati',
      sign_in_endpoint_field_name: 'URL di accesso',
      idp_entity_id_field_name: 'ID entità IdP (Emittente)',
      certificate_field_name: 'Certificato di firma',
      certificate_placeholder: 'Copia e incolla il certificato x509',
    },
    oidc: {
      client_id_field_name: 'ID client',
      client_secret_field_name: 'Segreto client',
      issuer_field_name: 'Emittente',
      scope_field_name: 'Ambito',
    },
  },
};

export default Object.freeze(enterprise_sso);

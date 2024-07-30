const organization_details = {
  page_title: "Dettagli dell'organizzazione",
  delete_confirmation:
    "Una volta eliminato, tutti i membri perderanno la loro iscrizione e ruoli in questa organizzazione. Quest'azione non può essere annullata.",
  organization_id: 'ID organizzazione',
  settings_description:
    'Le organizzazioni rappresentano i team, i clienti aziendali e le società partner che possono accedere alle tue applicazioni.',
  name_placeholder: "Il nome dell'organizzazione, non è necessario che sia univoco.",
  description_placeholder: "Una descrizione dell'organizzazione.",
  member: 'Membro',
  member_other: 'Membri',
  add_members_to_organization: "Aggiungi membri all'organizzazione {{name}}",
  add_members_to_organization_description:
    'Trova gli utenti appropriati cercando per nome, email, telefono o ID utente. Gli utenti già esistenti non vengono mostrati nei risultati della ricerca.',
  add_with_organization_role: "Aggiungi con ruolo(i) dell'organizzazione",
  user: 'Utente',
  application: 'Applicazione',
  application_other: 'Applicazioni',
  add_applications_to_organization: "Aggiungi applicazioni all'organizzazione {{name}}",
  add_applications_to_organization_description:
    'Trova applicazioni appropriate cercando per ID app, nome o descrizione. Le applicazioni esistenti non vengono mostrate nei risultati della ricerca.',
  at_least_one_application: 'È richiesta almeno una applicazione.',
  remove_application_from_organization: "Rimuovi applicazione dall'organizzazione",
  remove_application_from_organization_description:
    "Una volta rimossa, l'applicazione perderà la sua associazione e ruoli in questa organizzazione. Quest'azione non può essere annullata.",
  search_application_placeholder: 'Cerca per ID app, nome o descrizione',
  roles: "Ruoli dell'organizzazione",
  authorize_to_roles: 'Autorizza {{name}} ad accedere ai seguenti ruoli:',
  edit_organization_roles: "Modifica ruoli dell'organizzazione",
  edit_organization_roles_title: "Modifica ruoli dell'organizzazione di {{name}}",
  remove_user_from_organization: "Rimuovi utente dall'organizzazione",
  remove_user_from_organization_description:
    "Una volta rimosso, l'utente perderà la sua iscrizione e i ruoli in questa organizzazione. Quest'azione non può essere annullata.",
  search_user_placeholder: 'Cerca per nome, email, telefono o ID utente',
  at_least_one_user: 'È richiesto almeno un utente.',
  organization_roles_tooltip: "I ruoli assegnati al {{type}} all'interno di questa organizzazione.",
  custom_data: 'Dati personalizzati',
  custom_data_tip:
    "I dati personalizzati sono un oggetto JSON che può essere utilizzato per archiviare dati aggiuntivi associati all'organizzazione.",
  invalid_json_object: 'Oggetto JSON non valido.',
  branding: {
    logo: "Loghi dell'organizzazione",
    logo_tooltip:
      "Puoi passare l'ID dell'organizzazione per visualizzare questo logo nell'esperienza di accesso; è necessaria la versione scura del logo se la modalità scura è abilitata nelle impostazioni dell'esperienza di accesso omni. <a>Scopri di più</a>",
  },
  jit: {
    title: 'Provisioning just-in-time',
    description:
      "Gli utenti possono unirsi automaticamente all'organizzazione e ricevere ruoli al primo accesso attraverso alcuni metodi di autenticazione. Puoi impostare i requisiti da soddisfare per il provisioning just-in-time.",
    email_domain: 'Provisioning dominio email',
    email_domain_description:
      "I nuovi utenti che si iscrivono con i loro indirizzi email verificati o tramite accesso sociale con indirizzi email verificati si uniranno automaticamente all'organizzazione. <a>Scopri di più</a>",
    email_domain_placeholder: 'Inserisci domini email per il provisioning just-in-time',
    invalid_domain: 'Dominio non valido',
    domain_already_added: 'Dominio già aggiunto',
    sso_enabled_domain_warning:
      'Hai inserito uno o più domini email associati a SSO aziendale. Gli utenti con queste email seguiranno il flusso SSO standard e non verranno provisionati in questa organizzazione a meno che il provisioning SSO aziendale non sia configurato.',
    enterprise_sso: 'Provisioning SSO aziendale',
    no_enterprise_connector_set:
      'Non hai ancora configurato alcun connettore SSO aziendale. Aggiungi prima i connettori per abilitare il provisioning SSO aziendale. <a>Imposta</a>',
    add_enterprise_connector: 'Aggiungi connettore aziendale',
    enterprise_sso_description:
      "I nuovi utenti o gli utenti esistenti che accedono tramite SSO aziendale per la prima volta si uniranno automaticamente all'organizzazione. <a>Scopri di più</a>",
    organization_roles: 'Ruoli organizzazione predefiniti',
    organization_roles_description:
      "Assegna ruoli agli utenti all'atto dell'iscrizione all'organizzazione tramite il provisioning just-in-time.",
  },
  mfa: {
    title: 'Autenticazione multifattore (MFA)',
    tip: "Quando è richiesta l'MFA, agli utenti senza MFA configurata verrà negato l'accesso quando tenteranno di scambiare un token dell'organizzazione. Questa impostazione non influisce sull'autenticazione dell'utente.",
    description:
      "Richiedi agli utenti di configurare l'autenticazione multifattore per accedere a questa organizzazione.",
    no_mfa_warning:
      'Nessun metodo di autenticazione multifattore è abilitato per il tuo tenant. Gli utenti non potranno accedere a questa organizzazione finché non viene abilitato almeno un <a>metodo di autenticazione multifattore</a>.',
  },
};

export default Object.freeze(organization_details);

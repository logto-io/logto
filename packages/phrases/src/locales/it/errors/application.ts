const application = {
  invalid_type: 'Solo le applicazioni da macchina a macchina possono avere ruoli associati.',
  role_exists: "L'ID ruolo {{roleId}} è già stato aggiunto a questa applicazione.",
  invalid_role_type:
    "Impossibile assegnare un ruolo di tipo utente all'applicazione da macchina a macchina.",
  invalid_third_party_application_type:
    'Solo le applicazioni web tradizionali possono essere contrassegnate come applicazione di terze parti.',
  third_party_application_only:
    'La funzionalità è disponibile solo per le applicazioni di terze parti.',
  user_consent_scopes_not_found: 'Scopi di consenso utente non validi.',
  /** UNTRANSLATED */
  protected_app_metadata_is_required: 'Protected app metadata is required.',
};

export default Object.freeze(application);

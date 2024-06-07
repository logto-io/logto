const role = {
  name_in_use: 'Il nome di ruolo {{name}} è già in uso',
  scope_exists: "L'identificatore di ambito {{scopeId}} è già stato aggiunto a questo ruolo",
  management_api_scopes_not_assignable_to_user_role:
    "Impossibile assegnare scope dell'API di gestione a un ruolo utente.",
  user_exists: "L'identificatore di utente {{userId}} è già stato aggiunto a questo ruolo",
  application_exists:
    "L'ID dell'applicazione {{applicationId}} è già stato aggiunto a questo ruolo",
  default_role_missing:
    'Alcuni dei nomi di ruolo predefiniti non esistono nel database, assicurati di creare prima i ruoli',
  internal_role_violation:
    'Potresti cercare di aggiornare o eliminare un ruolo interno che è vietato da Logto. Se stai creando un nuovo ruolo, prova un altro nome che non inizi con "#internal:". ',
};

export default Object.freeze(role);

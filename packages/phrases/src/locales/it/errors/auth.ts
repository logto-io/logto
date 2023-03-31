const auth = {
  authorization_header_missing: 'Header Autorizzazione mancante.',
  authorization_token_type_not_supported: 'Tipo di autorizzazione non supportato.',
  unauthorized: 'Non autorizzato. Controlla le credenziali e il loro ambito.',
  forbidden: "Vietato. Controlla i ruoli e le autorizzazioni dell'utente.",
  expected_role_not_found:
    "Ruolo atteso non trovato. Controlla i ruoli e le autorizzazioni dell'utente.",
  jwt_sub_missing: 'Manca il valore `sub` in JWT.',
  require_re_authentication:
    "È necessaria una nuova autenticazione per eseguire un'azione protetta.",
};

export default auth;

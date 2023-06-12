const application_details = {
  page_title: "Dettagli dell'applicazione",
  back_to_applications: 'Torna alle applicazioni',
  check_guide: 'Verifica guida',
  settings: 'Impostazioni',
  settings_description:
    'Le applicazioni vengono utilizzate per identificare le tue applicazioni in Logto per OIDC, esperienza di accesso, registri di controllo, ecc.',
  advanced_settings: 'Impostazioni avanzate',
  advanced_settings_description:
    "Le impostazioni avanzate includono termini correlati all'OIDC. Puoi consultare il Endpoint Token per ulteriori informazioni.",
  application_name: "Nome dell'applicazione",
  application_name_placeholder: 'La mia app',
  description: 'Descrizione',
  description_placeholder: 'Inserisci la descrizione della tua applicazione',
  config_endpoint: 'OpenID Provider configuration endpoint', // UNTRANSLATED
  authorization_endpoint: 'Authorization Endpoint',
  authorization_endpoint_tip:
    "L'endpoint per effettuare l'autenticazione e l'autorizzazione. Viene utilizzato per la connessione OpenID <a>autenticazione</a>.",
  application_id: 'ID Applicazione',
  application_id_tip:
    'L\'identificatore univoco dell\'applicazione generato normalmente da Logto. Sta anche per "<a>client_id</a>" in OpenID Connect.',
  application_secret: 'App Segreta',
  redirect_uri: 'URI di reindirizzamento',
  redirect_uris: 'URI di reindirizzamento',
  redirect_uri_placeholder: 'https://il-tuo-sito-web.com/la-tua-app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'Il URI di reindirizzamento dopo il login di un utente (sia riuscito che non). Vedi OpenID Connect autenticazione richiesta per ulteriori informazioni.',
  post_sign_out_redirect_uri: 'URI di reindirizzamento post disconnessione',
  post_sign_out_redirect_uris: 'URI di reindirizzamento post disconnessione',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    "Il URI di reindirizzamento dopo la disconnessione dell'utente (facoltativo). Potrebbe non avere alcun effetto pratico in alcuni tipi di app.",
  cors_allowed_origins: 'Origini consentite CORS',
  cors_allowed_origins_placeholder: 'https://il-tuo-sito-web.com',
  cors_allowed_origins_tip:
    'Per impostazione predefinita, saranno consentite tutte le origini degli URI di reindirizzamento. Di solito non è richiesta alcuna azione per questo campo. Vedi la documentazione MDN per informazioni dettagliate.',
  id_token_expiration: 'Scadenza token ID',
  refresh_token_expiration: 'Scadenza token di aggiornamento',
  token_endpoint: 'Endpoint del token',
  user_info_endpoint: 'Endpoint delle informazioni utente',
  enable_admin_access: "Abilita l'accesso amministratore",
  enable_admin_access_label:
    "Abilita o disabilita l'accesso all'API di gestione. Una volta abilitato, puoi utilizzare i token di accesso per chiamare l'API di gestione a nome di questa applicazione.",
  always_issue_refresh_token: 'Rilascia sempre il token di aggiornamento',
  always_issue_refresh_token_label:
    'Abilitando questa configurazione, Logto potrà rilasciare sempre token di aggiornamento, anche se `prompt=consent` non viene presentata nella richiesta di autenticazione. Tuttavia, questa pratica è scoraggiata a meno che non sia necessaria, in quanto non è compatibile con OpenID Connect e potrebbe potenzialmente causare problemi.',
  refresh_token_ttl: 'Refresh Token Time to Live (TTL) in days', // UNTRANSLATED
  refresh_token_ttl_tip:
    'The duration during which a refresh token can be used to request new access tokens before it expires and becomes invalid.', // UNTRANSLATED
  rotate_refresh_token: 'Rotate Refresh Token', // UNTRANSLATED
  rotate_refresh_token_label:
    'When enabled, Logto will issue a new Refresh Token for token requests when 70% of the original Time to Live (TTL) has passed.', // UNTRANSLATED
  delete_description:
    "Questa azione non può essere annullata. Eliminerà definitivamente l'applicazione. Inserisci il nome dell'applicazione <span>{{name}}</span> per confermare.",
  enter_your_application_name: 'Inserisci il nome della tua applicazione',
  application_deleted: "L'applicazione {{name}} è stata eliminata con successo",
  redirect_uri_required: 'Devi inserire almeno un URI di reindirizzamento',
};

export default application_details;

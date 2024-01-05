const application_details = {
  page_title: "Dettagli dell'applicazione",
  back_to_applications: 'Torna alle applicazioni',
  check_guide: 'Verifica guida',
  settings: 'Impostazioni',
  settings_description:
    'Le applicazioni vengono utilizzate per identificare le tue applicazioni in Logto per OIDC, esperienza di accesso, registri di controllo, ecc.',
  /** UNTRANSLATED */
  endpoints_and_credentials: 'Endpoints & Credentials',
  /** UNTRANSLATED */
  endpoints_and_credentials_description:
    'Use the following endpoints and credentials to set up the OIDC connection in your application.',
  /** UNTRANSLATED */
  refresh_token_settings: 'Refresh token',
  /** UNTRANSLATED */
  refresh_token_settings_description: 'Manage the refresh token rules for this application.',
  application_roles: 'Ruoli',
  machine_logs: 'Log delle macchine',
  application_name: "Nome dell'applicazione",
  application_name_placeholder: 'La mia app',
  description: 'Descrizione',
  description_placeholder: 'Inserisci la descrizione della tua applicazione',
  config_endpoint: 'Endpoint di configurazione OpenID Provider',
  authorization_endpoint: 'Endpoint di autorizzazione',
  authorization_endpoint_tip:
    "L'endpoint per effettuare l'autenticazione e l'autorizzazione. Viene utilizzato per la connessione OpenID <a>autenticazione</a>.",
  /** UNTRANSLATED */
  show_endpoint_details: 'Show endpoint details',
  /** UNTRANSLATED */
  hide_endpoint_details: 'Hide endpoint details',
  logto_endpoint: 'Endpoint Logto',
  application_id: 'ID App',
  application_id_tip:
    'L\'identificatore univoco dell\'applicazione generato normalmente da Logto. Sta anche per "<a>client_id</a>" in OpenID Connect.',
  application_secret: 'Secret App',
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
  token_endpoint: 'Endpoint token',
  user_info_endpoint: 'Endpoint informazioni utente',
  enable_admin_access: "Abilita l'accesso amministratore",
  enable_admin_access_label:
    "Abilita o disabilita l'accesso all'API di gestione. Una volta abilitato, puoi utilizzare i token di accesso per chiamare l'API di gestione a nome di questa applicazione.",
  always_issue_refresh_token: 'Rilascia sempre il token di aggiornamento',
  always_issue_refresh_token_label:
    'Abilitando questa configurazione, Logto potrà rilasciare sempre token di aggiornamento, anche se `prompt=consent` non viene presentata nella richiesta di autenticazione. Tuttavia, questa pratica è scoraggiata a meno che non sia necessaria, in quanto non è compatibile con OpenID Connect e potrebbe potenzialmente causare problemi.',
  refresh_token_ttl: 'Tempo di vita del token di aggiornamento in giorni',
  refresh_token_ttl_tip:
    'La durata per cui un token di aggiornamento può essere utilizzato per richiedere nuovi access token prima che scada e diventa non valido, le richieste di token estenderanno il TTL del token di aggiornamento a questo valore.',
  rotate_refresh_token: 'Ruota token di aggiornamento',
  rotate_refresh_token_label:
    'Quando abilitato, Logto emetterà un nuovo token di aggiornamento per le richieste di token quando è passato il 70% del Tempo di vita (TTL) originale o sono soddisfatte determinate condizioni. <a>Ulteriori informazioni</a>',
  delete_description:
    "Questa azione non può essere annullata. Eliminerà definitivamente l'applicazione. Inserisci il nome dell'applicazione <span>{{name}}</span> per confermare.",
  enter_your_application_name: 'Inserisci il nome della tua applicazione',
  application_deleted: "L'applicazione {{name}} è stata eliminata con successo",
  redirect_uri_required: 'Devi inserire almeno un URI di reindirizzamento',
  roles: {
    name_column: 'Ruolo',
    description_column: 'Descrizione',
    assign_button: 'Assegna ruoli',
    delete_description:
      'Questa azione rimuoverà questo ruolo da questa applicazione tra macchine. Il ruolo stesso esisterà ancora, ma non sarà più associato a questa applicazione tra macchine.',
    deleted: '{{name}} è stato rimosso con successo da questo utente.',
    assign_title: 'Assegna ruoli a {{name}}',
    assign_subtitle: 'Autorizza {{name}} uno o più ruoli',
    assign_role_field: 'Assegna ruoli',
    role_search_placeholder: 'Cerca per nome ruolo',
    added_text: '{{value, number}} aggiunti',
    assigned_app_count: '{{value, number}} applicazioni',
    confirm_assign: 'Assegna ruoli',
    role_assigned: 'Ruolo(i) assegnato con successo',
    search: 'Cerca per nome ruolo, descrizione o ID',
    empty: 'Nessun ruolo disponibile',
  },
};

export default Object.freeze(application_details);

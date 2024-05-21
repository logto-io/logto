const application_details = {
  page_title: "Dettagli dell'applicazione",
  back_to_applications: 'Torna alle applicazioni',
  check_guide: 'Verifica guida',
  settings: 'Impostazioni',
  settings_description:
    "Un \"Applicazione\" è un software o servizio registrato che può accedere alle informazioni dell'utente o agire per conto di un utente. Le applicazioni aiutano a riconoscere chi sta chiedendo cosa da Logto e gestiscono l'accesso e le autorizzazioni. Compila i campi obbligatori per l'autenticazione.",
  integration: 'Integrazione',
  integration_description:
    "Implementa con i lavoratori sicuri di Logto, supportati dalla rete perimetrale di Cloudflare per prestazioni di prim'ordine e avviamenti istantanei in tutto il mondo a 0 ms.",
  service_configuration: 'Configurazione del servizio',
  service_configuration_description: 'Completa le configurazioni necessarie nel tuo servizio.',
  session: 'Sessione',
  endpoints_and_credentials: 'Endpoint e Credenziali',
  endpoints_and_credentials_description:
    'Usa i seguenti endpoint e credenziali per configurare la connessione OIDC nella tua applicazione.',
  refresh_token_settings: 'Token di aggiornamento',
  refresh_token_settings_description:
    'Gestisci le regole dei token di aggiornamento per questa applicazione.',
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
  show_endpoint_details: 'Mostra dettagli endpoint',
  hide_endpoint_details: 'Nascondi dettagli endpoint',
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
  app_domain_description_1:
    'Sentiti libero di utilizzare il tuo dominio con {{domain}} alimentato da Logto, che è permanentemente valido.',
  app_domain_description_2:
    'Sentiti libero di utilizzare il tuo dominio <domain>{{domain}}</domain> che è permanentemente valido.',
  custom_rules: 'Regole di autenticazione personalizzate',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    "Imposta le regole con espressioni regolari per percorsi richiesti per l'autenticazione. Predefinito: protezione completa del sito se lasciato vuoto.",
  authentication_routes: 'Percorsi di autenticazione',
  custom_rules_tip:
    "Ecco due scenari:<ol><li>Per proteggere solo i percorsi '/admin' e '/privacy' con autenticazione: ^/(admin|privacy)/.*</li><li>Per escludere le immagini JPG dall'autenticazione: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    "Reindirizza l'autenticazione del tuo pulsante utilizzando i percorsi specificati. Nota: questi percorsi sono irrimovibili.",
  protect_origin_server: 'Proteggi il tuo server di origine',
  protect_origin_server_description:
    "Assicurati di proteggere il tuo server di origine dall'accesso diretto. Fai riferimento alla guida per ulteriori <a>istruzioni dettagliate</a>.",
  session_duration: 'Durata della sessione (giorni)',
  try_it: 'Provalo',
  branding: {
    name: 'Marchio',
    description: "Personalizza il nome e il logo dell'applicazione sullo schermo del consenso.",
    more_info: 'Maggiori informazioni',
    more_info_description:
      "Offri agli utenti ulteriori dettagli sull'applicazione sullo schermo del consenso.",
    display_name: 'Nome visualizzato',
    display_logo: 'Logo visualizzato',
    display_logo_dark: 'Logo visualizzato (scuro)',
    terms_of_use_url: "URL termini d'uso dell'applicazione",
    privacy_policy_url: "URL politica sulla privacy dell'applicazione",
  },
  permissions: {
    name: 'Autorizzazioni',
    description:
      "Seleziona le autorizzazioni che l'applicazione di terze parti richiede per l'autorizzazione dell'utente all'accesso a tipi di dati specifici.",
    user_permissions: 'Dati utente personali',
    organization_permissions: 'Accesso organizzazione',
    table_name: 'Concedi autorizzazioni',
    field_name: 'Autorizzazione',
    field_description: 'Visualizzato nello schermo del consenso',
    delete_text: 'Rimuovi autorizzazione',
    permission_delete_confirm:
      "Questa azione revocherà le autorizzazioni concesse all'applicazione di terze parti, impedendole di richiedere l'autorizzazione dell'utente per tipi di dati specifici. Sei sicuro di voler continuare?",
    permissions_assignment_description:
      "Seleziona le autorizzazioni richieste dall'applicazione di terze parti per l'autorizzazione dell'utente all'accesso a tipi di dati specifici.",
    user_profile: 'Dati utente',
    api_permissions: 'Autorizzazioni API',
    organization: 'Autorizzazioni organizzazione',
    user_permissions_assignment_form_title: 'Aggiungi le autorizzazioni del profilo utente',
    organization_permissions_assignment_form_title:
      "Aggiungi le autorizzazioni dell'organizzazione",
    api_resource_permissions_assignment_form_title: 'Aggiungi le autorizzazioni delle risorse API',
    user_data_permission_description_tips:
      'Puoi modificare la descrizione delle autorizzazioni dei dati personali degli utenti tramite "Esperienza di accesso > Contenuto > Gestisci lingue".',
    permission_description_tips:
      "Quando Logto viene utilizzato come Provider di Identità (IdP) per l'autenticazione nelle app di terze parti e agli utenti viene chiesta l'autorizzazione, questa descrizione appare sullo schermo del consenso.",
    user_title: 'Utente',
    user_description:
      "Seleziona le autorizzazioni richieste dall'applicazione di terze parti per accedere a tipi specifici di dati utente.",
    grant_user_level_permissions: 'Concedi autorizzazioni dei dati utente',
    organization_title: 'Organizzazione',
    organization_description:
      "Seleziona le autorizzazioni richieste dall'applicazione di terze parti per accedere a tipi specifici di dati organizzazione.",
    grant_organization_level_permissions: 'Concedi autorizzazioni dei dati organizzazione',
  },
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

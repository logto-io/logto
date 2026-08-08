const jwt_claims = {
  title: 'JWT personalizzato',
  description:
    'Personalizza il token di accesso o token ID, fornendo informazioni aggiuntive alla tua applicazione.',
  access_token: {
    card_title: 'Token di accesso',
    card_description:
      'Il token di accesso è la credenziale utilizzata dalle API per autorizzare le richieste, contenente solo le richieste necessarie per le decisioni di accesso.',
  },
  user_jwt: {
    card_field: 'Token di accesso utente',
    card_description:
      "Aggiungi dati specifici dell'utente durante l'emissione del token di accesso.",
    for: 'per utente',
  },
  machine_to_machine_jwt: {
    card_field: 'Token di accesso da macchina a macchina',
    card_description: "Aggiungi dati extra durante l'emissione del token da macchina a macchina.",
    for: 'per M2M',
  },
  id_token: {
    card_title: 'Token ID',
    card_description:
      "Il token ID è un'asserzione di identità ricevuta dopo l'accesso, contenente richieste di identità utente per il client da utilizzare per la visualizzazione o la creazione di sessioni.",
    card_field: 'Token ID utente',
    card_field_description:
      "Le richieste 'sub', 'email', 'phone', 'profile' e 'address' sono sempre disponibili. Le altre richieste devono prima essere abilitate qui. In tutti i casi, la tua app deve richiedere gli scopes corrispondenti durante l'integrazione per riceverli.",
  },
  code_editor_title: 'Personalizza le richieste {{token}}',
  custom_jwt_create_button: 'Aggiungi richieste personalizzate',
  custom_jwt_item: 'Richieste personalizzate {{for}}',
  delete_modal_title: 'Elimina richieste personalizzate',
  delete_modal_content: 'Sei sicuro di voler eliminare le richieste personalizzate?',
  clear: 'Pulisci',
  cleared: 'Pulito',
  restore: 'Ripristina predefiniti',
  restored: 'Ripristinato',
  data_source_tab: 'Sorgente dati',
  error_handling_tab: 'Gestione degli errori',
  test_tab: 'Contesto di test',
  jwt_claims_description:
    'Le richieste predefinite sono incluse automaticamente nel JWT e non possono essere sovrascritte.',
  user_data: {
    title: 'Dati utente',
    subtitle:
      "Utilizza il parametro di input `context.user` per fornire informazioni vitali sull'utente.",
  },
  grant_data: {
    title: 'Dati concessione',
    subtitle:
      'Usa il parametro di input `context.grant` per fornire informazioni vitali sulla concessione, disponibile solo per lo scambio di token.',
  },
  interaction_data: {
    title: 'Contesto di interazione utente',
    subtitle:
      "Utilizza il parametro `context.interaction` per accedere ai dettagli dell'interazione dell'utente per la sessione di autenticazione corrente.",
  },
  application_data: {
    title: "Contesto dell'applicazione",
    subtitle:
      "Utilizza il parametro di input `context.application` per fornire le informazioni dell'applicazione associate al token.",
  },
  organization_data: {
    title: "Contesto dell'organizzazione",
    subtitle:
      "Utilizza il parametro di input `context.organization` per fornire le informazioni dell'organizzazione di destinazione, disponibile solo per i token dell'organizzazione.",
  },
  token_data: {
    title: 'Dati token',
    subtitle:
      'Utilizza il parametro di input `token` per il payload corrente del token di accesso.',
  },
  api_context: {
    title: 'Contesto API: controllo accessi',
    subtitle: 'Usa il metodo `api.denyAccess` per rifiutare la richiesta di token.',
  },
  cryptographic_capability: {
    title: 'Contesto API: crittografia',
    subtitle: "Usa `api.crypto.sha256` e `api.crypto.hmacSha256` per l'hashing UTF-8.",
    description:
      "Entrambi i metodi sono asincroni e restituiscono una Promise con una stringa esadecimale minuscola di 64 caratteri. Gli input sono codificati come UTF-8 senza normalizzazione Unicode: `sha256(input)` calcola SHA-256(UTF-8(input)); `hmacSha256({ key, input })` calcola HMAC-SHA-256(UTF-8(key), UTF-8(input)). Leggi le chiavi HMAC dalle variabili d'ambiente, chiama tu `.trim()` e rifiuta un risultato vuoto prima di invocare HMAC — il metodo non esegue mai trim né ricade su SHA-256. Preferisci una chiave ad alta entropia senza spazi. Un input messaggio vuoto è valido; una chiave vuota no. L'input è limitato a 1 MiB di byte UTF-8 e una chiave HMAC a 64 KiB. SHA-256 non nasconde identificatori enumerabili come email o numeri di telefono; usa HMAC per un identificatore stabile con chiave segreta. Nessun metodo è adatto all'archiviazione di password. Le variabili d'ambiente sono visibili agli amministratori Custom JWT autorizzati e al runtime di esecuzione, e non sono un sistema di chiavi gestito. Ruotare una chiave HMAC cambia ogni valore derivato — gli script che necessitano una migrazione devono portare una versione di chiave definita dall'applicazione e implementare eventuali periodi a doppio valore. Più valori richiedono una serializzazione non ambigua definita dal chiamante (ad es. `JSON.stringify([value1, value2])` nello stesso runtime); le integrazioni cross-language devono concordare la propria forma canonica. Su Logto self-hosted questo script mantiene il modello di script attendibile descritto nell'avviso sandbox.",
  },
  error_handling: {
    title: 'Gestione degli errori',
    subtitle: "Controlla se l'emissione del token deve essere bloccata quando lo script fallisce.",
    input_field_title: "Comportamento dell'emissione del token in caso di errore dello script",
    block_issuance_switch: "Blocca l'emissione del token quando lo script genera errori",
    default_hint_create:
      "I nuovi script per le custom claims bloccano per impostazione predefinita l'emissione del token quando lo script fallisce. Se l'API fornisce già un valore, verrà usato il valore salvato.",
    default_hint_edit:
      'Per gli script di custom claims esistenti senza questa impostazione, il comportamento legacy mantiene questa opzione disattivata finché non salvi esplicitamente un valore.',
    warning:
      'Quando abilitato, gli errori di runtime dello script rifiutano la richiesta del token con `invalid_request` (400) e un `error_description` localizzato. Le chiamate a `api.denyAccess` continuano a restituire `access_denied`.',
  },
  fetch_external_data: {
    title: 'Recupera dati esterni',
    subtitle: 'Incorpora dati direttamente dai tuoi API esterni nelle richieste.',
    description:
      'Utilizza la funzione `fetch` per chiamare le tue API esterne e includere i dati nelle richieste personalizzate. Esempio: ',
  },
  environment_variables: {
    title: "Imposta variabili d'ambiente",
    subtitle: "Utilizza variabili d'ambiente per memorizzare informazioni sensibili.",
    input_field_title: "Aggiungi variabili d'ambiente",
    sample_code:
      "Accesso alle variabili d'ambiente nel gestore delle richieste JWT personalizzate. Esempio: ",
  },
  jwt_claims_hint:
    'Limita le richieste personalizzate a meno di 50KB. Le richieste JWT predefinite sono incluse automaticamente nel token e non possono essere sovrascritte.',
  tester: {
    subtitle: 'Regola il token fittizio e i dati utente per il test.',
    run_button: 'Esegui test',
    result_title: 'Risultato del test',
  },
  sandbox_warning: {
    title: 'Gli script vengono eseguiti con i privilegi del server',
    description:
      'Su Logto self-hosted, questo script viene eseguito nello stesso ambiente di Logto: può leggere le variabili d’ambiente del server e raggiungere i servizi della rete interna. Non è sandboxato. Concedi l’accesso a questa pagina solo a persone a cui fidaresti l’accesso al server.',
  },
  form_error: {
    invalid_json: 'Formato JSON non valido',
  },
};

export default Object.freeze(jwt_claims);

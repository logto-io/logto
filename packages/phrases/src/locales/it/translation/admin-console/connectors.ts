const connectors = {
  page_title: 'Connettori',
  title: 'Connettori',
  subtitle:
    "Imposta i connettori per abilitare un'esperienza di accesso senza password e tramite social media",
  create: 'Aggiungi connettore sociale',
  config_sie_notice: 'Hai impostato i connettori. Assicurati di configurarli in <a>{{link}}</a>.',
  config_sie_link_text: 'esperienza di accesso',
  tab_email_sms: 'Connettori email e SMS',
  tab_social: 'Connettori social',
  connector_name: 'Nome del connettore',
  demo_tip:
    'Il numero massimo di messaggi consentiti per questo connettore demo è limitato a 100 e non è consigliato per il deployment in un ambiente di produzione.',
  social_demo_tip:
    'Il connettore demo è progettato esclusivamente per scopi di dimostrazione e non è consigliato per il deployment in un ambiente di produzione.',
  connector_type: 'Tipo',
  connector_status: 'Esperienza di accesso',
  connector_status_in_use: 'In uso',
  connector_status_not_in_use: 'Non in uso',
  not_in_use_tip: {
    content:
      'Non in uso significa che la tua esperienza di accesso non ha utilizzato questo metodo di accesso. <a>{{link}}</a> per aggiungere questo metodo di accesso.',
    go_to_sie: "Vai all'esperienza di accesso",
  },
  placeholder_title: 'Connettore sociale',
  placeholder_description:
    'Logto ha fornito molti connettori di accesso condivisi tramite i social media, frattanto puoi creare il tuo usando i protocolli standard.',
  save_and_done: 'Salva e Completa',
  type: {
    email: 'Connettore email',
    sms: 'Connettore SMS',
    social: 'Connettore sociale',
  },
  setup_title: {
    email: 'Imposta connettore email',
    sms: 'Imposta connettore SMS',
    social: 'Aggiungi connettore sociale',
  },
  guide: {
    subtitle: 'Una guida passo passo per configurare il tuo connettore',
    general_setting: 'Impostazioni generali',
    parameter_configuration: 'Configurazione dei parametri',
    test_connection: 'Prova la connessione',
    name: 'Nome per il pulsante di accesso tramite social media',
    name_placeholder: 'Inserisci il nome per il pulsante di accesso tramite social media',
    name_tip:
      'Il nome del pulsante del connettore verrà visualizzato come "Continua con {{name}}." Presta attenzione alla lunghezza del nome in caso risulti troppo lungo.',
    logo: 'URL del logo per il pulsante di accesso tramite social media',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      "L'immagine del logo verrà mostrata sul connettore. Otteni un link di immagine pubblicamente accessibile e inserisci qui il link.",
    logo_dark: 'URL del logo per il pulsante di accesso tramite social media (modalità scura)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      "Imposta il logo del tuo connettore per la modalità scura dopo averla abilitata nell'esperienza di accesso nel Console dell'Amministratore.",
    logo_dark_collapse: 'Comprimi',
    logo_dark_show: 'Mostra le impostazioni del logo per la modalità scura',
    target: 'Nome del provider di identità',
    target_placeholder: 'Inserisci il nome del provider di identità del connettore',
    target_tip:
      'Il valore del "Nome IdP" può essere una stringa di identificatore univoco per distinguere le identità social.',
    target_tip_standard:
      'Il valore del "Nome IdP" può essere una stringa di identificatore univoco per distinguere le identità social. Questa impostazione non può essere cambiata dopo la costruzione del connettore.',
    target_tooltip:
      "'Nome IdP' nei connettori social di Logto si riferisce alla 'fonte' delle tue identità social media. Nel design di Logto, non accettiamo lo stesso 'Nome IdP' di una piattaforma specifica per evitare conflitti. Devi fare molta attenzione prima di aggiungere un connettore, poiché NON PUOI cambiarne il valore una volta creato. <a>Scopri di più</a>",
    target_conflict:
      "Il nome IdP inserito corrisponde al connettore <span>nome</span> esistente. L'utilizzo dello stesso nome IdP potrebbe causare un comportamento di accesso imprevisto in cui gli utenti possono accedere allo stesso account tramite due connettori diversi.",
    target_conflict_line2:
      'Se desideri sostituire il connettore corrente con lo stesso provider di identità e consentire agli utenti precedenti di accedere senza registrarsi nuovamente, elimina il connettore <span>nome</span> e crea un nuovo connettore con lo stesso "Nome IdP".',
    target_conflict_line3:
      'Se desideri connetterti a un provider di identità diverso, modifica il "Nome IdP" e procedi.',
    config: 'Inserisci il tuo JSON di configurazione',
    sync_profile: 'Sincronizza le informazioni del profilo',
    sync_profile_only_at_sign_up: 'Sincronizza solo al momento della registrazione',
    sync_profile_each_sign_in: 'Effettua sempre una sincronizzazione ad ogni accesso',
    sync_profile_tip:
      'Sincronizza il profilo di base dal provider social, ad esempio i nomi degli utenti e le loro immagini del profilo.',
    callback_uri: 'URI di callback',
    callback_uri_description:
      "Anche chiamato URI di reindirizzamento, è l'URI in Logto dove gli utenti verranno rimandati dopo l'autorizzazione tramite social media, copia e incollalo nella pagina di configurazione del provider social media.",
    acs_url: 'URL del servizio consumer di assunzione',
  },
  platform: {
    universal: 'Universale',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: 'supporta più piattaforme, seleziona una piattaforma per continuare',
  drawer_title: 'Guida per il connettore',
  drawer_subtitle: 'Segui le istruzioni per integrare il tuo connettore',
  unknown: 'Connettore sconosciuto',
  standard_connectors: 'Connettori standard',
};

export default Object.freeze(connectors);

const cloud = {
  welcome: {
    page_title: 'Benvenuto',
    title: 'Benvenuto e creiamo insieme la tua anteprima di Logto Cloud',
    description:
      'Che tu sia un utente open-source o cloud, fai un tour della vetrina e scopri il valore completo di Logto. Cloud preview serve anche come versione preliminare di Logto Cloud.',
    project_field: 'Sto usando Logto per',
    project_options: {
      personal: 'Progetto personale',
      company: 'Progetto aziendale',
    },
    deployment_type_field: 'Preferisci open-source o cloud?',
    deployment_type_options: {
      open_source: 'Open-Source',
      cloud: 'Cloud',
    },
  },
  about: {
    page_title: "Un po' di te",
    title: "Un po' di te per rendere unica la tua esperienza Logto",
    description:
      'Facciamo diventare la tua esperienza Logto unica conoscendoti meglio. Le tue informazioni sono al sicuro con noi.',
    title_field: 'La tua posizione',
    title_options: {
      developer: 'Sviluppatore',
      team_lead: 'Team Lead',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Prodotto',
      others: 'Altro',
    },
    company_name_field: "Nome dell'azienda",
    company_name_placeholder: 'Acme.co',
    company_size_field: "Dimensione dell'azienda",
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Mi sto iscrivendo perché',
    reason_options: {
      passwordless: 'Ricerca di autenticazione senza password e UI kit',
      efficiency: 'Scoperta di infrastrutture di identità preconfezionate',
      access_control: "Controllo dell'accesso degli utenti in base ai ruoli e alle responsabilità",
      multi_tenancy: 'Ricerca di strategie per un prodotto multi-tenancy',
      enterprise: 'Ricerca di soluzioni SSO per la preparazione aziendale',
      others: 'Altro',
    },
  },
  congrats: {
    page_title: 'Guadagna crediti in anticipo',
    title: 'Fantastiche notizie! Sei qualificato per guadagnare i primi crediti di Logto Cloud!',
    description:
      "Non perdere l'occasione di usufruire di una sottoscrizione gratuita di Logto Cloud per  <strong>60 giorni</strong> dopo il lancio ufficiale! Contatta subito il team di Logto per saperne di più.",
    check_out_button: 'Guarda la anteprima dal vivo',
    email_us_title: 'Scrivici una email per offerta speciale e dettagli di prezzo',
    email_us_description: 'Ottieni prezzi esclusivi per risparmiare denaro',
    email_us_button: 'Invia email',
    join_description:
      'Entra nel nostro <a>{{link}}</a> pubblico per connetterti e chattare con altri sviluppatori.',
    discord_link: 'canale discord',
    enter_admin_console: 'Entra in Logto Cloud Preview',
  },
  gift: {
    title: 'Utilizza Logto Cloud gratuitamente per 60 giorni. Unisciti ai primi.',
    description:
      'Prenota una sessione individuale con il nostro team per ottenere crediti anticipati.',
    reserve_title: 'Prenota il tuo tempo con il team Logto',
    reserve_description: 'Il credito è disponibile solo previa valutazione.',
    book_button: 'Prenota',
    email_us_title: 'Scrivici una email',
    email_us_description: 'Contattaci per una offerta speciale e dettagli di prezzo.',
    email_us_button: 'Invia',
  },
  sie: {
    page_title: "Personalizza l'esperienza di accesso",
    title: 'Personalizziamo insieme la tua esperienza di accesso',
    inspire: {
      title: 'Crea esempi coinvolgenti',
      description:
        'Ti senti incerto riguardo l\'esperienza di accesso? Fai clic su "Ispirami" e lascia che la magia accada!',
      inspire_me: 'Ispirami',
    },
    logo_field: "Logo dell'app",
    color_field: 'Colore del brand',
    identifier_field: 'Identificativo',
    identifier_options: {
      email: 'Email',
      phone: 'Telefono',
      user_name: 'Nome utente',
    },
    authn_field: 'Autenticazione',
    authn_options: {
      password: 'Password',
      verification_code: 'Codice di verifica',
    },
    social_field: 'Accesso tramite social',
    finish_and_done: 'Termina e completato',
    preview: {
      mobile_tab: 'Mobile',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Sbloccato in seguito',
      unlocked_later_tip:
        'Una volta completato il processo di onboarding e inserito il prodotto, avrai accesso a ancora più metodi di accesso tramite social.',
      notice:
        'Si prega di evitare di utilizzare il connettore demo per scopi di produzione. Una volta completati i test, cancellare gentilmente il connettore demo e configurare il proprio connettore con le proprie credenziali.',
    },
  },
  broadcast: '📣 Sei in Logto Cloud (Preview)',
  socialCallback: {
    title: 'Accesso effettuato con successo',
    description:
      "Hai effettuato l'accesso con successo utilizzando il tuo account social. Per garantire integrazione senza problemi e accesso a tutte le funzionalità di Logto, ti consigliamo di procedere alla configurazione del tuo connettore social.",
  },
};

export default cloud;

const cloud = {
  general: {
    onboarding: 'Inizio',
  },
  welcome: {
    page_title: 'Benvenuto',
    title: "Benvenuto in Logto Cloud! Ci piacerebbe conoscere un po' di te.",
    description:
      'Facciamo diventare la tua esperienza Logto unica conoscendoti meglio. Le tue informazioni sono al sicuro con noi.',
    project_field: 'Sto usando Logto per',
    project_options: {
      personal: 'Progetto personale',
      company: 'Progetto aziendale',
    },
    company_name_field: "Nome dell'azienda",
    company_name_placeholder: 'Acme.co',
    stage_field: 'In quale fase si trova attualmente il tuo prodotto?',
    stage_options: {
      new_product: "Inizia un nuovo progetto e cerca una soluzione rapida e pronta all'uso",
      existing_product:
        "Migra dall'autenticazione attuale (ad esempio, autenticazione autocostruita, Auth0, Cognito, Microsoft)",
      target_enterprise_ready:
        'Ho appena acquisito clienti più importanti e ora rendo il mio prodotto pronto per essere venduto alle imprese',
    },
    additional_features_field: "Qualcos'altro che desideri farci sapere?",
    additional_features_options: {
      customize_ui_and_flow:
        'Costruisci e gestisci la mia stessa interfaccia utente, non solo utilizzo la soluzione predefinita e personalizzabile di Logto',
      compliance: 'SOC2 e GDPR sono imprescindibili',
      export_user_data: 'Necessità di esportare i dati utente da Logto',
      budget_control: 'Ho un controllo molto stretto sul budget',
      bring_own_auth:
        'Ho i miei servizi di autenticazione e ho solo bisogno di alcune funzionalità di Logto',
      others: 'Nessuna delle opzioni sopra',
    },
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
  socialCallback: {
    title: 'Accesso effettuato con successo',
    description:
      "Hai effettuato l'accesso con successo utilizzando il tuo account social. Per garantire integrazione senza problemi e accesso a tutte le funzionalità di Logto, ti consigliamo di procedere alla configurazione del tuo connettore social.",
  },
  tenant: {
    create_tenant: 'Crea tenant',
  },
};

export default Object.freeze(cloud);

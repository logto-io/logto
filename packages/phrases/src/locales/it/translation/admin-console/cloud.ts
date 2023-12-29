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
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
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

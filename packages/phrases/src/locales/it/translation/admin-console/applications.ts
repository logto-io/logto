const applications = {
  page_title: 'Applicazioni',
  title: 'Applicazioni',
  subtitle:
    "Configura l'autenticazione Logto per la tua applicazione nativa, a singola pagina, macchina-to-macchina o tradizionale",
  subtitle_with_app_type: "Configura l'autenticazione Logto per la tua applicazione {{name}}",
  create: 'Crea Applicazione',
  create_third_party: 'Crea applicazione di terze parti',
  create_thrid_party_modal_title: "Crea un'app di terze parti ({{type}})",
  application_name: 'Nome applicazione',
  application_name_placeholder: 'La mia App',
  application_description: 'Descrizione applicazione',
  application_description_placeholder: 'Inserisci la descrizione della tua applicazione',
  select_application_type: 'Seleziona un tipo di applicazione',
  no_application_type_selected: 'Non hai ancora selezionato alcun tipo di applicazione',
  application_created: "L'applicazione è stata creata con successo.",
  tab: {
    my_applications: 'Le mie app',
    third_party_applications: 'App di terze parti',
  },
  app_id: 'App ID',
  type: {
    native: {
      title: 'App Nativa',
      subtitle: "Un'applicazione che viene eseguita in un ambiente nativo",
      description: 'E.g., applicazione iOS, applicazione Android',
    },
    spa: {
      title: 'Applicazione a Singola Pagina',
      subtitle:
        "Un'applicazione che viene eseguita in un browser web e aggiorna dinamicamente i dati in maniera localizzata",
      description: 'E.g., applicazione React DOM, applicazione Vue',
    },
    traditional: {
      title: 'Web Tradizionale',
      subtitle: "Un'applicazione che renderizza e aggiorna le pagine solo attraverso il server web",
      description: 'E.g., Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Macchina-to-Macchina',
      subtitle: "Un'app (solitamente un servizio) che comunica direttamente con le risorse",
      description: 'E.g., servizio backend',
    },
    protected: {
      title: 'App Protetta',
      subtitle: 'Un app protetta da Logto',
      description: 'N/A',
    },
    saml: {
      title: 'App SAML',
      subtitle: "Un'app utilizzata come connettore IdP di SAML",
      description: 'E.g., SAML',
    },
    third_party: {
      title: 'App di Terze Parti',
      subtitle: 'Un app utilizzata come connettore IdP di terze parti',
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Seleziona un tipo di applicazione per continuare',
  placeholder_description:
    "Logto utilizza un'entità applicazione per OIDC per aiutarti in compiti come l'identificazione delle tue app, la gestione dell'accesso e la creazione di registri di audit.",
  third_party_application_placeholder_description:
    "Usa Logto come fornitore di identità per fornire l'autorizzazione OAuth ai servizi di terze parti. \n Include uno schermo preconfigurato di consenso utente per l'accesso alle risorse. <a>Scopri di più</a>",
  guide: {
    third_party: {
      title: 'Integra un’applicazione di terze parti',
      description:
        "Usa Logto come fornitore di identità per fornire l'autorizzazione OAuth ai servizi di terze parti. Include una schermata di consenso utente preconfigurata per un accesso sicuro alle risorse. <a>Scopri di più</a>",
    },
  },
};

export default Object.freeze(applications);

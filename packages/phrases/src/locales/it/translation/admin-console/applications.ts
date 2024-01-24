const applications = {
  page_title: 'Applicazioni',
  title: 'Applicazioni',
  subtitle:
    "Configura l'autenticazione Logto per la tua applicazione nativa, a singola pagina, macchina-to-macchina o tradizionale",
  subtitle_with_app_type: "Configura l'autenticazione Logto per la tua applicazione {{name}}",
  create: 'Crea Applicazione',
  application_name: 'Nome applicazione',
  application_name_placeholder: 'La mia App',
  application_description: 'Descrizione applicazione',
  application_description_placeholder: 'Inserisci la descrizione della tua applicazione',
  select_application_type: 'Seleziona un tipo di applicazione',
  no_application_type_selected: 'Non hai ancora selezionato alcun tipo di applicazione',
  application_created: "L'applicazione è stata creata con successo.",
  tab: {
    /** UNTRANSLATED */
    my_applications: 'My apps',
    /** UNTRANSLATED */
    third_party_applications: 'Third-party apps',
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
      /** UNTRANSLATED */
      title: 'Protected App',
      /** UNTRANSLATED */
      subtitle: 'An app that is protected by Logto',
      /** UNTRANSLATED */
      description: 'N/A',
    },
    third_party: {
      /** UNTRANSLATED */
      title: 'Third-party app',
      /** UNTRANSLATED */
      subtitle: 'An app that is used as a third-party IdP connector',
      /** UNTRANSLATED */
      description: 'E.g., OIDC, SAML',
    },
  },
  placeholder_title: 'Seleziona un tipo di applicazione per continuare',
  placeholder_description:
    "Logto utilizza un'entità applicazione per OIDC per aiutarti in compiti come l'identificazione delle tue app, la gestione dell'accesso e la creazione di registri di audit.",
};

export default Object.freeze(applications);

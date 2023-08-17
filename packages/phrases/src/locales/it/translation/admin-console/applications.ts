const applications = {
  page_title: 'Applicazioni',
  title: 'Applicazioni',
  subtitle:
    "Configura l'autenticazione Logto per la tua applicazione nativa, a singola pagina, macchina-to-macchina o tradizionale",
  subtitle_with_app_type: 'Set up Logto authentication for your {{name}} application', // UNTRANSLATED
  create: 'Crea Applicazione',
  application_name: 'Nome applicazione',
  application_name_placeholder: 'La mia App',
  application_description: 'Descrizione applicazione',
  application_description_placeholder: 'Inserisci la descrizione della tua applicazione',
  select_application_type: 'Seleziona un tipo di applicazione',
  no_application_type_selected: 'Non hai ancora selezionato alcun tipo di applicazione',
  application_created:
    "L'applicazione {{name}} è stata creata con successo.\nOra completa le impostazioni della tua applicazione.",
  app_id: 'ID App',
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
  },
  guide: {
    header_title: 'Select a framework or tutorial', // UNTRANSLATED
    modal_header_title: 'Start with SDK and guides', // UNTRANSLATED
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.', // UNTRANSLATED
    start_building: 'Start Building', // UNTRANSLATED
    categories: {
      featured: 'Popular and for you', // UNTRANSLATED
      Traditional: 'Traditional web app', // UNTRANSLATED
      SPA: 'Single page app', // UNTRANSLATED
      Native: 'Native', // UNTRANSLATED
      MachineToMachine: 'Machine-to-machine', // UNTRANSLATED
    },
    filter: {
      title: 'Filter framework', // UNTRANSLATED
      placeholder: 'Search for framework', // UNTRANSLATED
    },
    select_a_framework: 'Select a framework', // UNTRANSLATED
    checkout_tutorial: 'Checkout {{name}} tutorial', // UNTRANSLATED
    get_sample_file: 'Scarica Esempio',
    title: "L'applicazione è stata creata con successo",
    subtitle:
      'Ora segui i passi di seguito per completare le impostazioni della tua app. Seleziona il tipo di SDK per continuare.',
    description_by_sdk: "Questa guida rapida illustra come integrare Logto in un'app {{sdk}}",
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide', // UNTRANSLATED
    create_without_framework: 'Create app without framework', // UNTRANSLATED
    finish_and_done: 'Completato e fatto',
    cannot_find_guide: "Can't find your guide?", // UNTRANSLATED
    describe_guide_looking_for: 'Describe the guide you are looking for', // UNTRANSLATED
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.', // UNTRANSLATED
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!', // UNTRANSLATED
  },
  placeholder_title: 'Seleziona un tipo di applicazione per continuare',
  placeholder_description:
    "Logto utilizza un'entità applicazione per OIDC per aiutarti in compiti come l'identificazione delle tue app, la gestione dell'accesso e la creazione di registri di audit.",
};

export default Object.freeze(applications);

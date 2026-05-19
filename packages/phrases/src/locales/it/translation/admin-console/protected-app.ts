const protected_app = {
  name: 'Applicazione Protetta',
  title: "Crea un'App Protetta: Aggiungi autenticazione con semplicità e velocità epica",
  fast_create: 'Creazione rapida',
  modal_title: "Crea un'App Protetta",
  modal_subtitle:
    'Abilita una protezione sicura e veloce con pochi clic. Aggiungi facilmente autenticazione alla tua app web esistente.',
  form: {
    url_field_label: 'URL di origine',
    url_field_placeholder: 'https://dominio.com/',
    url_field_description:
      "Fornisci l'indirizzo della tua app che richiede protezione tramite autenticazione.",
    url_field_modification_notice:
      "Le modifiche all'URL di origine possono impiegare da 1 a 2 minuti per diventare effettive in tutte le posizioni della rete globale.",
    url_field_tooltip:
      "Fornisci l'indirizzo della tua applicazione, escludendo qualsiasi '/percorso'. Dopo la creazione, puoi personalizzare le regole di autenticazione del percorso.\n\nNota: L'URL di origine di per sé non richiede autenticazione; la protezione è applicata esclusivamente agli accessi tramite il dominio dell'app designato.",
    domain_field_label: "Dominio dell'App",
    domain_field_placeholder: 'tuo-dominio',
    domain_field_description:
      "Questo URL funge da proxy di protezione dell'autenticazione per l'URL originale. Il dominio personalizzato può essere applicato dopo la creazione.",
    domain_field_description_short:
      "Questo URL funge da proxy di protezione dell'autenticazione per l'URL originale.",
    domain_field_tooltip:
      "Le app protette da Logto saranno ospitate di default su 'tuo-dominio.{{domain}}'. Il dominio personalizzato può essere applicato dopo la creazione.",
    create_application: 'Crea applicazione',
    create_protected_app: 'Creazione rapida',
    errors: {
      domain_required: 'Il tuo dominio è obbligatorio.',
      domain_in_use: 'Questo nome sottodominio è già in uso.',
      invalid_domain_format:
        "Formato di sottodominio non valido: utilizza solo lettere minuscole, numeri e trattini '-'.",
      url_required: "L'URL di origine è obbligatorio.",
      invalid_url:
        "Formato URL di origine non valido: Usa http:// o https://. Nota: '/percorso' non è attualmente supportato.",
      localhost:
        'Si prega di esporre prima il proprio server locale su Internet. Scopri di più su <a>sviluppo locale</a>.',
    },
  },
  id_token_claims: {
    card_title: "Claim dell'ID token",
    card_description:
      "Richiedi scope utente aggiuntivi durante l'accesso all'app protetta per includere i claim estesi abilitati nell'ID token inoltrato.",
    field_title: 'Scope aggiuntivi',
    field_description:
      'I claim sono inclusi solo quando sono abilitati in <a>Custom JWT > ID token</a> e lo scope corrispondente è richiesto qui.',
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'Claim inoltrati',
    disabled_claims_hint:
      "I claim in grigio non sono ancora inoltrati. Abilitali in <a>Custom JWT > ID token</a> per includerli nell'ID token.",
  },
  success_message:
    "🎉 Autenticazione dell'app abilitata con successo! Esplora la nuova esperienza del tuo sito web.",
};

export default Object.freeze(protected_app);

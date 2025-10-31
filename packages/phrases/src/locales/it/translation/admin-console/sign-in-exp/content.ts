const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'Aggiungi termini e privacy per soddisfare i requisiti di conformità.',
    terms_of_use: "URL dei termini d'uso",
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: "URL dell'informativa sulla privacy",
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Accettare i termini',
    agree_policies: {
      automatic: 'Continuare ad accettare automaticamente i termini',
      manual_registration_only:
        "Richiedere l'accordo della casella di controllo solo alla registrazione",
      manual: "Richiedere l'accordo della casella di controllo sia alla registrazione che al login",
    },
  },
  languages: {
    title: 'LINGUE',
    enable_auto_detect: 'Abilita il rilevamento automatico',
    description:
      "Il tuo software rileva le impostazioni locali dell'utente e passa alla lingua locale. Puoi aggiungere nuove lingue traducendo l'interfaccia dall'inglese a un'altra lingua.",
    manage_language: 'Gestisci lingua',
    default_language: 'Lingua predefinita',
    default_language_description_auto:
      "La lingua predefinita verrà usata quando la lingua rilevata dell'utente non è presente nella libreria attuale.",
    default_language_description_fixed:
      "Quando il rilevamento automatico è disattivato, la lingua predefinita è l'unica che il software mostrerà. Attiva il rilevamento automatico per ampliare le lingue.",
  },
  support: {
    title: 'SUPPORTO',
    subtitle:
      'Mostra i tuoi canali di supporto sulle pagine di errore per un rapido aiuto agli utenti.',
    support_email: 'Email di supporto',
    support_email_placeholder: 'support@email.com',
    support_website: 'Sito web di supporto',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Gestisci lingua',
    subtitle:
      "Localizza l'esperienza del prodotto aggiungendo lingue e traduzioni. Il tuo contributo può essere impostato come lingua predefinita.",
    add_language: 'Aggiungi lingua',
    logto_provided: 'Fornito da Logto',
    key: 'Chiave',
    logto_source_values: 'Valori originali Logto',
    custom_values: 'Valori personalizzati',
    clear_all_tip: 'Cancella tutti i valori',
    unsaved_description: 'Le modifiche non verranno salvate se lasci questa pagina senza salvare.',
    deletion_tip: 'Elimina lingua',
    deletion_title: 'Vuoi eliminare la lingua aggiunta?',
    deletion_description:
      "Dopo l'eliminazione, gli utenti non potranno più navigare in quella lingua.",
    default_language_deletion_title: 'Impossibile eliminare la lingua predefinita.',
    default_language_deletion_description:
      '{{language}} è impostata come lingua predefinita e non può essere eliminata.',
  },
};

export default Object.freeze(content);

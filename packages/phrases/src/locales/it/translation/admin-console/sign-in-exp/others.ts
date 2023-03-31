const others = {
  terms_of_use: {
    title: 'TERMINI',
    terms_of_use: "URL dei termini d'uso",
    terms_of_use_placeholder: 'https://tuoi.termini.di.uso/',
    privacy_policy: 'URL della politica sulla privacy',
    privacy_policy_placeholder: 'https://tua.politica.sulla.privacy/',
  },
  languages: {
    title: 'LINGUE',
    enable_auto_detect: 'Abilita rilevamento automatico',
    description:
      "Il software rileva l'impostazione di lingua dell'utente e passa alla lingua locale. Puoi aggiungere nuove lingue traducendo l'interfaccia utente dall'inglese a un'altra lingua.",
    manage_language: 'Gestisci lingua',
    default_language: 'Lingua predefinita',
    default_language_description_auto:
      "La lingua predefinita verrà utilizzata quando la lingua dell'utente rilevata non è coperta dalla libreria delle lingue attuali.",
    default_language_description_fixed:
      "Quando il rilevamento automatico è disattivato, l'unica lingua che il tuo software mostrerà è quella predefinita. Attivare il rilevamento automatico per l'estensione delle lingue.",
  },
  manage_language: {
    title: 'Gestisci lingua',
    subtitle:
      "Localizza l'esperienza del prodotto aggiungendo lingue e traduzioni. Il tuo contributo può essere impostato come lingua predefinita.",
    add_language: 'Aggiungi lingua',
    logto_provided: 'Logtogli forniti',
    key: 'Chiave',
    logto_source_values: 'Valori di origine Logtogli',
    custom_values: 'Valori personalizzati',
    clear_all_tip: 'Cancella tutti i valori',
    unsaved_description: 'Le modifiche non saranno salvate se lasci la pagina senza salvare.',
    deletion_tip: 'Elimina la lingua',
    deletion_title: 'Vuoi eliminare la lingua aggiunta?',
    deletion_description:
      "Dopo l'eliminazione, i tuoi utenti non saranno più in grado di navigare in quella lingua.",
    default_language_deletion_title: 'La lingua predefinita non può essere eliminata.',
    default_language_deletion_description:
      '{{language}} è impostata come tua lingua predefinita e non può essere eliminata.',
  },
  advanced_options: {
    title: 'OPZIONI AVANZATE',
    enable_user_registration: 'Abilita registrazione utente',
    enable_user_registration_description:
      "Abilitare o impedire la registrazione degli utenti. Una volta disattivata, gli utenti possono ancora essere aggiunti nella console di amministrazione ma gli utenti non possono più creare account attraverso l'interfaccia di accesso.",
  },
};

export default others;

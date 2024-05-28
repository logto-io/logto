const api_resource_details = {
  page_title: 'Dettagli delle risorse API',
  back_to_api_resources: 'Torna alle risorse API',
  general_tab: 'Generale',
  permissions_tab: 'Autorizzazioni',
  settings: 'Impostazioni',
  settings_description:
    "Le risorse API, anche note come Indicatori di Risorse, indicano i servizi o le risorse di destinazione da richiedere, di solito una variabile di formato URI che rappresenta l'identità della risorsa.",
  management_api_settings_description:
    "La Logto Management API è una raccolta completa di API che consentono agli amministratori di gestire una vasta gamma di attività relative all'identità, far rispettare le politiche di sicurezza e conformarsi a regolamenti e standard.",
  management_api_notice:
    "Questa API rappresenta l'entità Logto e non può essere modificata o eliminata. Puoi utilizzare la Management API per un'ampia gamma di attività relative all'identità. <a>Scopri di più</a>",
  token_expiration_time_in_seconds: 'Tempo di scadenza del token (in secondi)',
  token_expiration_time_in_seconds_placeholder: 'Inserisci il tempo di scadenza del tuo token',
  delete_description:
    'Questa azione non può essere annullata. Eliminerà definitivamente la risorsa API. Per favore, inserisci il nome della risorsa api <span>{{name}}</span> per confermare.',
  enter_your_api_resource_name: 'Inserisci il nome della tua risorsa API',
  api_resource_deleted: 'La risorsa API {{name}} è stata eliminata con successo',
  permission: {
    create_button: 'Crea autorizzazione',
    create_title: 'crea autorizzazione',
    create_subtitle: 'Definire le autorizzazioni (ambiti) necessarie per questa API.',
    confirm_create: 'Crea autorizzazione',
    edit_title: 'Modifica autorizzazione',
    edit_subtitle: 'Definire le autorizzazioni (ambiti) necessarie per la API {{resourceName}}.',
    name: 'Nome autorizzazione',
    name_placeholder: 'lettura:risorsa',
    forbidden_space_in_name: "Il nome dell'autorizzazione non deve contenere spazi.",
    description: 'Descrizione',
    description_placeholder: 'In grado di leggere le risorse',
    permission_created: "L'autorizzazione {{name}} è stata creata con successo",
    delete_description:
      "Se questa autorizzazione viene eliminata, l'utente che aveva questa autorizzazione perderà l'accesso concessogli tramite di essa.",
    deleted: 'L\'autorizzazione "{{name}}" è stata eliminata con successo.',
  },
};

export default Object.freeze(api_resource_details);

const domain = {
  status: {
    connecting: 'Connessione in corso',
    in_used: 'In uso',
    failed_to_connect: 'Connessione fallita',
  },
  update_endpoint_alert: {
    description:
      'Il tuo dominio personalizzato è stato configurato correttamente. Non dimenticare di aggiornare il dominio che hai usato per {{domain}} se hai configurato le risorse di seguito in precedenza.',
    endpoint_url: 'URL di endpoint di <a>{{link}}</a>',
    application_settings_link_text: 'Impostazioni applicazione',
    callback_url: 'URL di callback di <a>{{link}}</a>',
    social_connector_link_text: 'Connettore social',
    api_identifier: 'Identificatore API di <a>{{link}}</a>',
    uri_management_api_link_text: 'API di gestione degli URI',
    tip: 'Dopo aver modificato le impostazioni, puoi testarlo nella nostra esperienza di accesso <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Dominio personalizzato',
    custom_domain_description:
      "Sostituisci il dominio predefinito con il tuo dominio per mantenere la coerenza con il tuo marchio e personalizzare l'esperienza di accesso per i tuoi utenti.",
    custom_domain_field: 'Dominio personalizzato',
    custom_domain_placeholder: 'tuodominio.com',
    add_domain: 'Aggiungi dominio',
    invalid_domain_format: 'Formato del dominio non valido',
    steps: {
      add_records: {
        title: 'Aggiungi i seguenti record DNS al tuo provider DNS',
        generating_dns_records: 'Generazione dei record DNS in corso...',
        table: {
          type_field: 'Tipo',
          name_field: 'Nome',
          value_field: 'Valore',
        },
        finish_and_continue: 'Fine e continua',
      },
      verify_domain: {
        title: 'Verifica automaticamente la connessione dei record DNS',
        description:
          "Il processo verrà eseguito automaticamente, il che potrebbe richiedere alcuni minuti (fino a 24 ore). Puoi uscire da questa interfaccia durante l'esecuzione.",
        error_message: 'Impossibile verificare. Controlla il tuo nome di dominio o record DNS.',
      },
      generate_ssl_cert: {
        title: 'Genera automaticamente un certificato SSL',
        description:
          "Il processo verrà eseguito automaticamente, il che potrebbe richiedere alcuni minuti (fino a 24 ore). Puoi uscire da questa interfaccia durante l'esecuzione.",
        error_message: 'Impossibile generare il certificato SSL.  ',
      },
      enable_domain: 'Abilita il tuo dominio personalizzato automaticamente',
    },
    deletion: {
      delete_domain: 'Elimina dominio',
      reminder: 'Elimina dominio personalizzato',
      description: 'Sei sicuro di voler eliminare questo dominio personalizzato?',
      in_used_description:
        'Sei sicuro di voler eliminare questo dominio personalizzato "{{domain}}"?',
      in_used_tip:
        'Se hai configurato questo dominio personalizzato nel tuo provider di connettori sociali o nel punto di fineponte dell\'applicazione in precedenza, dovrai modificare l\'URI per il dominio personalizzato Logto "{{domain}}" prima. Ciò è necessario per il corretto funzionamento del pulsante di accesso social.',
      deleted: 'Dominio personalizzato eliminato con successo!',
    },
  },
  default: {
    default_domain: 'Dominio predefinito',
    default_domain_description:
      "Forniamo un nome di dominio predefinito che può essere utilizzato direttamente online. È sempre disponibile, garantendo che la tua applicazione possa essere sempre accessibile per l'accesso, anche se passi a un dominio personalizzato.",
    default_domain_field: 'Dominio predefinito Logto',
  },
};

export default domain;

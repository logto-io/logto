const domain = {
  status: {
    connecting: 'Connessione in corso',
    in_used: 'In uso',
    failed_to_connect: 'Connessione fallita',
  },
  update_endpoint_alert: {
    description:
      'Il tuo dominio personalizzato è stato configurato correttamente. Non dimenticare di aggiornare il dominio che hai usato per <span>{{domain}}</span> se hai configurato le risorse di seguito in precedenza.',
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
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'Aggiungi dominio',
    invalid_domain_format:
      'Formato del sottodominio non valido. Inserisci un sottodominio con almeno tre parti.',
    verify_domain: 'Verifica dominio',
    enable_ssl: 'Abilita SSL',
    checking_dns_tip:
      "Dopo aver configurato i record DNS, il processo verrà eseguito automaticamente e potrebbe richiedere fino a 24 ore. Puoi lasciare questa interfaccia durante l'esecuzione.",
    generating_dns_records: 'Generazione dei record DNS...',
    add_dns_records: 'Inserisci questi record DNS nel tuo provider DNS.',
    dns_table: {
      type_field: 'Tipo',
      name_field: 'Nome',
      value_field: 'Valore',
    },
    deletion: {
      delete_domain: 'Elimina dominio',
      reminder: 'Elimina dominio personalizzato',
      description: 'Sei sicuro di voler eliminare questo dominio personalizzato?',
      in_used_description:
        'Sei sicuro di voler eliminare questo dominio personalizzato "<span>{{domain}}</span>"?',
      in_used_tip:
        'Se hai configurato questo dominio personalizzato nel tuo provider di connettore social o endpoint dell\'applicazione in precedenza, dovrai modificare l\'URI nel dominio predefinito Logto "<span>{{domain}}</span>". Questo è necessario per il corretto funzionamento del pulsante di accesso social.',
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

const domain = {
  status: {
    connecting: 'Connessione in corso',
    in_used: 'In uso',
    failed_to_connect: 'Connessione fallita',
  },
  update_endpoint_notice: {
    content:
      'Il tuo dominio personalizzato è stato configurato con successo. Ricorda di aggiornare il dominio utilizzato per il <social-link>{{socialLink}}</social-link> e per il <app-link>{{appLink}}</app-link> se avevi in precedenza configurato le risorse precedenti.',
    connector_callback_uri_text: 'URI di callback del connettore social',
    application_text: 'Endpoint di Logto per la tua applicazione',
  },
  error_hint:
    'Assicurati di aggiornare i tuoi record DNS. Continueremo a controllarli ogni {{value}} secondi.',
  custom: {
    custom_domain: 'Dominio personalizzato',
    custom_domain_description:
      "Sostituisci il dominio predefinito con il dominio di tua scelta per mantenere la coerenza con il tuo marchio e personalizzare l'esperienza di accesso per i tuoi utenti.",
    custom_domain_field: 'Dominio personalizzato',
    custom_domain_placeholder: 'il-tuo-dominio.com',
    add_domain: 'Aggiungi dominio',
    invalid_domain_format:
      'Formato del sottodominio non valido. Inserisci un sottodominio con almeno tre parti.',
    verify_domain: 'Verifica dominio',
    enable_ssl: 'Abilita SSL',
    checking_dns_tip:
      "Dopo aver configurato i record DNS, il processo verrà eseguito automaticamente e potrebbe richiedere fino a 24 ore. Puoi lasciare questa interfaccia durante l'esecuzione.",
    generating_dns_records: 'Generazione dei record DNS in corso...',
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
        'Se hai configurato in precedenza questo dominio personalizzato nel tuo provider di connettore social o endpoint dell\'applicazione, dovrai modificare l\'URI nel dominio Logto predefinito "<span>{{domain}}</span>". È necessario per il corretto funzionamento del pulsante di accesso social.',
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

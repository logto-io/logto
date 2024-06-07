const domain = {
  status: {
    connecting: 'Connessione in corso...',
    in_use: 'In uso',
    failed_to_connect: 'Connessione fallita',
  },
  update_endpoint_notice:
    "Non dimenticare di aggiornare il dominio per l'URI di callback del connettore social e l'endpoint Logto nella tua applicazione se vuoi utilizzare un dominio personalizzato per le funzionalità. <a>{{link}}</a>",
  error_hint:
    'Assicurati di aggiornare i tuoi record DNS. Continueremo a controllarli ogni {{value}} secondi.',
  custom: {
    custom_domain: 'Dominio personalizzato',
    custom_domain_description:
      'Migliora il tuo branding utilizzando un dominio personalizzato. Questo dominio verrà utilizzato nella tua esperienza di accesso.',
    custom_domain_field: 'Dominio personalizzato',
    custom_domain_placeholder: 'il-tuo-dominio.com',
    add_domain: 'Aggiungi dominio',
    invalid_domain_format:
      'Si prega di fornire un URL di dominio valido con un minimo di tre parti, ad esempio "tuo.dominio.com".',
    verify_domain: 'Verifica dominio',
    enable_ssl: 'Abilita SSL',
    checking_dns_tip:
      "Dopo aver configurato i record DNS, il processo verrà eseguito automaticamente e potrebbe richiedere fino a 24 ore. Puoi lasciare questa interfaccia durante l'esecuzione.",
    enable_ssl_tip:
      "Abilitare SSL verrà eseguito automaticamente e potrebbe richiedere fino a 24 ore. Puoi lasciare questa interfaccia durante l'esecuzione.",
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
      "Logto offre un dominio preconfigurato predefinito, pronto all'uso senza alcuna configurazione aggiuntiva. Questo dominio predefinito serve come opzione di backup anche se hai abilitato un dominio personalizzato.",
    default_domain_field: 'Dominio predefinito Logto',
  },
  custom_endpoint_note:
    'Puoi personalizzare il nome di dominio di questi endpoint come richiesto. Scegli "{{custom}}" o "{{default}}".',
  custom_social_callback_url_note:
    'Puoi personalizzare il nome di dominio di questo URI per corrispondere all\'endpoint della tua applicazione. Scegli "{{custom}}" o "{{default}}".',
  custom_acs_url_note:
    'Puoi personalizzare il nome di dominio di questo URI per corrispondere all\'URL del servizio consumer assertion provider del tuo fornitore di identità. Scegli "{{custom}}" o "{{default}}".',
};

export default Object.freeze(domain);

const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Aggiorna piano',
  compare_plans: 'Confronta i piani',
  get_started: {
    title: 'Inizia il tuo percorso di identità senza interruzioni con un piano gratuito!',
    description:
      "Il piano gratuito è perfetto per provare Logto nei tuoi progetti personali o test. Per sfruttare al massimo le capacità di Logto per il tuo team, esegui l'upgrade per ottenere l'accesso illimitato alle funzionalità premium: utilizzo illimitato di MAU, integrazione da macchina a macchina, gestione RBAC, registri di audit a lungo termine, ecc. <a>Visualizza tutti i piani</a>",
  },
  create_tenant: {
    title: 'Seleziona il piano del tenant',
    description:
      'Logto offre opzioni competitive di piani con una struttura dei prezzi innovativa e conveniente progettata per le aziende in crescita. <a>Scopri di più</a>',
    base_price: 'Prezzo base',
    monthly_price: '{{value, number}}/mese',
    mau_unit_price: 'Prezzo unitario MAU',
    view_all_features: 'Visualizza tutte le funzionalità',
    select_plan: 'Seleziona <name/>',
    free_tenants_limit: 'Fino a {{count, number}} tenant gratuito',
    free_tenants_limit_other: 'Fino a {{count, number}} tenant gratuiti',
    most_popular: 'Più popolare',
    upgrade_success: 'Aggiornamento a <name/> effettuato con successo',
  },
  paywall: {
    applications:
      'Limite di {{count, number}} applicazione di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
    applications_other:
      'Limite di {{count, number}} applicazioni di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
    machine_to_machine_feature:
      'Aggiorna a un piano a pagamento per creare applicazioni machine-to-machine e accedere a tutte le funzionalità premium. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
    machine_to_machine:
      'Limite di {{count, number}} applicazione machine-to-machine di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
    machine_to_machine_other:
      'Limite di {{count, number}} applicazioni machine-to-machine di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
    resources:
      'Hai raggiunto il limite di {{count, number}} risorse API di <planName/>. Aggiorna il piano per soddisfare le esigenze del tuo team. <a>Contattaci</a> per qualsiasi assistenza.',
    resources_other:
      'Hai raggiunto il limite di {{count, number}} risorse API di <planName/>. Aggiorna il piano per soddisfare le esigenze del tuo team. <a>Contattaci</a> per qualsiasi assistenza.',
    scopes_per_resource:
      'Hai raggiunto il limite di {{count, number}} autorizzazioni per risorsa API di <planName/>. Aggiorna ora per espanderlo. <a>Contattaci</a> per qualsiasi assistenza.',
    scopes_per_resource_other:
      'Hai raggiunto il limite di {{count, number}} autorizzazioni per risorsa API di <planName/>. Aggiorna ora per espanderlo. <a>Contattaci</a> per qualsiasi assistenza.',
    custom_domain:
      'Sblocca la funzionalità di dominio personalizzato e una serie di vantaggi premium passando a un piano a pagamento. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    social_connectors:
      'Hai raggiunto il limite di {{count, number}} connettori sociali di <planName/>. Passa al piano per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    social_connectors_other:
      'Hai raggiunto il limite di {{count, number}} connettori sociali di <planName/>. Passa al piano per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    standard_connectors_feature:
      'Aggiorna a un piano a pagamento per creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML, oltre a ottenere connettori sociali illimitati e tutte le funzionalità premium. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    standard_connectors:
      'Hai raggiunto il limite di {{count, number}} connettori sociali di <planName/>. Passa al piano per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    standard_connectors_other:
      'Hai raggiunto il limite di {{count, number}} connettori sociali di <planName/>. Passa al piano per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    standard_connectors_pro:
      'Hai raggiunto il limite di {{count, number}} connettori standard di <planName/>. Passa al piano Enterprise per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    standard_connectors_pro_other:
      'Hai raggiunto il limite di {{count, number}} connettori standard di <planName/>. Passa al piano Enterprise per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    roles:
      'Hai raggiunto il limite di {{count, number}} ruoli di <planName/>. Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    roles_other:
      'Hai raggiunto il limite di {{count, number}} ruoli di <planName/>. Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    scopes_per_role:
      'Hai raggiunto il limite di {{count, number}} autorizzazioni per ruolo di <planName/>. Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    scopes_per_role_other:
      'Hai raggiunto il limite di {{count, number}} autorizzazioni per ruolo di <planName/>. Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    hooks:
      'Hai raggiunto il limite di {{count, number}} webhook di <planName/>. Aggiorna il piano per creare altri webhook. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
    hooks_other:
      'Hai raggiunto il limite di {{count, number}} webhook di <planName/>. Aggiorna il piano per creare altri webhook. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  },
  mau_exceeded_modal: {
    title: 'MAU ha superato il limite. Aggiorna il tuo piano.',
    notification:
      'Il tuo MAU attuale ha superato il limite di <planName/>. Aggiorna al piano premium tempestivamente per evitare la sospensione del servizio Logto.',
    update_plan: 'Aggiorna piano',
  },
  payment_overdue_modal: {
    title: 'Pagamento della fattura in ritardo',
    notification:
      "Oops! Il pagamento della fattura dell'affittuario <span>{{name}}</span> è fallito. Si prega di pagare tempestivamente la fattura per evitare la sospensione del servizio Logto.",
    unpaid_bills: 'Fatture non pagate',
    update_payment: 'Aggiorna pagamento',
  },
};

export default upsell;

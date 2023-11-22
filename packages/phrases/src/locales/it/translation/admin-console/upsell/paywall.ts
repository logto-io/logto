const paywall = {
  applications:
    'Limite di {{count, number}} applicazione di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  applications_other:
    'Limite di {{count, number}} applicazioni di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  machine_to_machine_feature:
    "Aggiorna al piano <strong>Hobby</strong> per sbloccare 1 applicazione machine-to-machine, oppure scegli il piano <strong>Pro</strong> per l'utilizzo illimitato. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.",
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
    'Sblocca la funzionalità del dominio personalizzato passando al piano <strong>Hobby</strong> o <strong>Pro</strong>. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  social_connectors:
    'Hai raggiunto il limite di {{count, number}} connettori sociali di <planName/>. Passa al piano per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  social_connectors_other:
    'Hai raggiunto il limite di {{count, number}} connettori sociali di <planName/>. Passa al piano per ottenere connettori sociali aggiuntivi e la possibilità di creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  standard_connectors_feature:
    'Aggiorna al piano <strong>Hobby</strong> o <strong>Pro</strong> per creare i tuoi connettori utilizzando i protocolli OIDC, OAuth 2.0 e SAML, oltre a connettori sociali illimitati e tutte le funzionalità premium. Sentiti libero di <a>contattarci</a> se hai bisogno di assistenza.',
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
  mfa: 'Sblocca MFA per verificare la sicurezza passando a un piano a pagamento. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  /** UNTRANSLATED */
  organizations:
    'Unlock organizations by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
};

export default Object.freeze(paywall);

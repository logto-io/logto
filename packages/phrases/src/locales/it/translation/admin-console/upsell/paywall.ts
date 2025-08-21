const paywall = {
  applications:
    'Limite di {{count, number}} applicazione di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  applications_other:
    'Limite di {{count, number}} applicazioni di <planName/> raggiunto. Aggiorna il piano per soddisfare le esigenze del tuo team. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  machine_to_machine_feature:
    'Passa al piano <strong>Pro</strong> per ottenere applicazioni extra machine-to-machine e goderti tutte le funzionalità premium. <a>Contattaci</a> se hai domande.',
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
    'Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  scopes_per_role:
    'Hai raggiunto il limite di {{count, number}} autorizzazioni per ruolo di <planName/>. Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  scopes_per_role_other:
    'Hai raggiunto il limite di {{count, number}} autorizzazioni per ruolo di <planName/>. Aggiorna il piano per aggiungere ruoli e autorizzazioni aggiuntive. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  saml_applications_oss:
    "L'app SAML aggiuntiva è disponibile con il piano Logto Enterprise. Contattaci se hai bisogno di assistenza.",
  logto_pricing_button_text: 'Prezzi del Logto Cloud',
  saml_applications:
    "L'app SAML aggiuntiva è disponibile con il piano Logto Enterprise. Contattaci se hai bisogno di assistenza.",
  saml_applications_add_on:
    "Sblocca la funzionalità dell'app SAML passando a un piano a pagamento. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.",
  hooks:
    'Hai raggiunto il limite di {{count, number}} webhook di <planName/>. Aggiorna il piano per creare altri webhook. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  hooks_other:
    'Hai raggiunto il limite di {{count, number}} webhook di <planName/>. Aggiorna il piano per creare altri webhook. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  mfa: 'Sblocca MFA per verificare la sicurezza passando a un piano a pagamento. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  organizations:
    'Sblocca le organizzazioni passando a un piano a pagamento. Non esitare a <a>contattarci</a> se hai bisogno di assistenza.',
  third_party_apps:
    'Sblocca Logto come IdP per applicazioni di terze parti passando a un piano a pagamento. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  sso_connectors:
    'Sblocca SSO aziendale passando a un piano a pagamento. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  tenant_members:
    'Sblocca la funzionalità di collaborazione passando a un piano a pagamento. Per qualsiasi assistenza, non esitare a <a>contattarci</a>.',
  tenant_members_dev_plan:
    'Hai raggiunto il limite di {{limit}} membri. Rilascia un membro o revoca un invito in sospeso per aggiungerne uno nuovo. Hai bisogno di più posti? Non esitare a contattarci.',
  custom_jwt: {
    title: 'Aggiungi reclami personalizzati',
    description:
      'Aggiorna a un piano a pagamento per la funzionalità JWT personalizzata e benefici premium. Non esitare a <a>contattarci</a> se hai domande.',
  },
  bring_your_ui:
    'Aggiorna a un piano a pagamento per portare la tua funzionalità di interfaccia utente personalizzata e beneficiare dei vantaggi premium.',
  security_features:
    'Sblocca funzionalità di sicurezza avanzate passando al piano Pro. Non esitare a <a>contattarci</a> se hai domande.',
  collect_user_profile:
    'Aggiorna a un piano a pagamento per raccogliere informazioni aggiuntive del profilo utente durante la registrazione. Non esitare a <a>contattarci</a> se hai domande.',
};

export default Object.freeze(paywall);

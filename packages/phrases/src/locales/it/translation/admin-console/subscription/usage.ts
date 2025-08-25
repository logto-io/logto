const usage = {
  status_active: 'In uso',
  status_inactive: 'Non in uso',
  limited_status_quota_description: '(Primi {{quota}} inclusi)',
  unlimited_status_quota_description: '(Incluso)',
  disabled_status_quota_description: '(Non incluso)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Illimitato)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (Primi {{basicQuota}} inclusi)</span>',
  usage_description_without_quota: '{{usage}}<span> (Non incluso)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Un MAU è un utente unico che ha scambiato almeno un token con Logto durante un ciclo di fatturazione. Illimitato per il piano Pro. <a>Scopri di più</a>',
    tooltip_for_enterprise:
      'Un MAU è un utente unico che ha scambiato almeno un token con Logto durante un ciclo di fatturazione. Illimitato per il piano Enterprise.',
  },
  organizations: {
    title: 'Organizzazioni',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di organizzazioni o dal loro livello di attività.',
    description_for_enterprise: '(Incluso)',
    tooltip_for_enterprise:
      "L'inclusione dipende dal tuo piano. Se la funzione organizzativa non è nel tuo contratto iniziale, verrà aggiunta alla fattura quando la attivi. Il componente aggiuntivo costa ${{price, number}}/mese, indipendentemente dal numero di organizzazioni o dalla loro attività.",
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Il tuo piano include le prime {{basicQuota}} organizzazioni gratuitamente. Se ne hai bisogno di più, puoi aggiungerle con il componente aggiuntivo per le organizzazioni a un costo fisso di ${{price, number}} al mese, indipendentemente dal numero di organizzazioni o dal loro livello di attività.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di fattori di autenticazione utilizzati.',
    tooltip_for_enterprise:
      "L'inclusione dipende dal tuo piano. Se la funzione MFA non è nel tuo contratto iniziale, verrà aggiunta alla fattura quando la attivi. Il componente aggiuntivo costa ${{price, number}}/mese, indipendentemente dal numero di fattori di autenticazione utilizzati.",
  },
  enterprise_sso: {
    title: 'SSO aziendale',
    tooltip:
      'Funzionalità aggiuntiva con un costo di ${{price, number}} per connessione SSO al mese.',
    tooltip_for_enterprise:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per connessione SSO al mese. Le prime {{basicQuota}} SSO sono incluse e gratuite nel tuo piano basato su contratto.',
  },
  api_resources: {
    title: 'Risorse API',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per risorsa al mese. Le prime 3 risorse API sono gratuite.',
    tooltip_for_enterprise:
      'Le prime {{basicQuota}} risorse API sono incluse e gratuite nel tuo piano basato su contratto. Se ne hai bisogno di più, ${{price, number}} per risorsa API al mese.',
  },
  machine_to_machine: {
    title: 'Macchina a macchina',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per app al mese. La prima app macchina a macchina è gratuita.',
    tooltip_for_enterprise:
      'La prima {{basicQuota}} app macchina a macchina è gratuita nel tuo piano basato su contratto. Se ne hai bisogno di più, ${{price, number}} per app al mese.',
  },
  tenant_members: {
    title: 'Membri del tenant',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per membro al mese. Il primo {{count}} membro del tenant è gratuito.',
    tooltip_one:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per membro al mese. Il primo {{count}} membro del tenant è gratuito.',
    tooltip_other:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per membro al mese. I primi {{count}} membri del tenant sono gratuiti.',
    tooltip_for_enterprise:
      'I primi {{basicQuota}} membri del tenant sono inclusi e gratuiti nel tuo piano basato su contratto. Se ne hai bisogno di più, ${{price, number}} per membro del tenant al mese.',
  },
  tokens: {
    title: 'Token',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per {{tokenLimit}} di token. Il primo {{basicQuota}} di token è incluso.',
    tooltip_for_enterprise:
      'Il primo {{basicQuota}} di token è incluso e gratuito nel tuo piano basato su contratto. Se ne hai bisogno di più, ${{price, number}} per {{tokenLimit}} di token al mese.',
  },
  hooks: {
    title: 'Hook',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per hook. I primi 10 hook sono inclusi.',
    tooltip_for_enterprise:
      'I primi {{basicQuota}} hook sono inclusi e gratuiti nel tuo piano basato su contratto. Se ne hai bisogno di più, ${{price, number}} per hook al mese.',
  },
  security_features: {
    title: 'Sicurezza avanzata',
    tooltip:
      "Funzionalità aggiuntiva con un prezzo di ${{price, number}}/mese per l'intero pacchetto di sicurezza avanzata, che include CAPTCHA, blocco identificativo, lista nera email e altro.",
  },
  saml_applications: {
    title: 'App SAML',
    tooltip: 'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per app SAML al mese.',
  },
  third_party_applications: {
    title: 'App di terze parti',
    tooltip: 'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per app al mese.',
  },
  rbacEnabled: {
    title: 'Ruoli',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di ruoli globali.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      "Se effettui modifiche durante il ciclo di fatturazione corrente, la tua prossima fattura potrebbe essere leggermente più alta per il primo mese dopo la modifica. Sarà ${{price, number}} prezzo base più i costi aggiuntivi per l'utilizzo non fatturato dal ciclo corrente e l'intero addebito per il ciclo successivo. <a>Scopri di più</a>",
  },
};

export default Object.freeze(usage);

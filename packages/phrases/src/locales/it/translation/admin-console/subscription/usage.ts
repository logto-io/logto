const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Un MAU è un utente unico che ha scambiato almeno un token con Logto durante un ciclo di fatturazione. Illimitato per il piano Pro. <a>Scopri di più</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizzazioni',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di organizzazioni o dal loro livello di attività.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di fattori di autenticazione utilizzati.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'SSO aziendale',
    tooltip:
      'Funzionalità aggiuntiva con un costo di ${{price, number}} per connessione SSO al mese.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'Risorse API',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per risorsa al mese. Le prime 3 risorse API sono gratuite.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Macchina a macchina',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per app al mese. La prima app macchina a macchina è gratuita.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Membri del tenant',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per membro al mese. I primi 3 membri del tenant sono gratuiti.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Token',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per {{tokenLimit}} di token. Il primo {{basicQuota}} di token è incluso.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Hook',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per hook. I primi 10 hook sono inclusi.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      "Se effettui modifiche durante il ciclo di fatturazione corrente, la tua prossima fattura potrebbe essere leggermente più alta per il primo mese dopo la modifica. Sarà ${{price, number}} prezzo base più i costi aggiuntivi per l'utilizzo non fatturato dal ciclo corrente e l'intero addebito per il ciclo successivo. <a>Scopri di più</a>",
  },
};

export default Object.freeze(usage);

const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Un MAU è un utente unico che ha scambiato almeno un token con Logto durante un ciclo di fatturazione. Illimitato per il piano Pro. <a>Scopri di più</a>',
  },
  organizations: {
    title: 'Organizzazioni',
    description: '{{usage}}',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di organizzazioni o dal loro livello di attività.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Funzionalità aggiuntiva con una tariffa fissa di ${{price, number}} al mese. Il prezzo non è influenzato dal numero di fattori di autenticazione utilizzati.',
  },
  enterprise_sso: {
    title: 'SSO aziendale',
    description: '{{usage}}',
    tooltip:
      'Funzionalità aggiuntiva con un costo di ${{price, number}} per connessione SSO al mese.',
  },
  api_resources: {
    title: 'Risorse API',
    description: '{{usage}} <span>(Gratis per i primi 3)</span>',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per risorsa al mese. Le prime 3 risorse API sono gratuite.',
  },
  machine_to_machine: {
    title: 'Macchina a macchina',
    description: '{{usage}} <span>(Gratis per il primo)</span>',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per app al mese. La prima app macchina a macchina è gratuita.',
  },
  tenant_members: {
    title: 'Membri del tenant',
    description: '{{usage}} <span>(Gratis per i primi 3)</span>',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per membro al mese. I primi 3 membri del tenant sono gratuiti.',
  },
  tokens: {
    title: 'Token',
    description: '{{usage}}',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per milione di token. Il primo milione di token è incluso.',
  },
  hooks: {
    title: 'Hook',
    description: '{{usage}} <span>(Gratis per i primi 10)</span>',
    tooltip:
      'Funzionalità aggiuntiva con un prezzo di ${{price, number}} per hook. I primi 10 hook sono inclusi.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      "Se effettui modifiche durante il ciclo di fatturazione corrente, la tua prossima fattura potrebbe essere leggermente più alta per il primo mese dopo la modifica. Sarà ${{price, number}} prezzo base più i costi aggiuntivi per l'utilizzo non fatturato dal ciclo corrente e l'intero addebito per il ciclo successivo. <a>Scopri di più</a>",
  },
};

export default Object.freeze(usage);

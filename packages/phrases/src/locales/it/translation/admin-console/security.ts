const security = {
  page_title: 'Sicurezza',
  title: 'Sicurezza',
  subtitle: 'Configura una protezione avanzata contro attacchi sofisticati.',
  bot_protection: {
    title: 'Protezione dei bot',
    description:
      'Abilita CAPTCHA per registrazioni, accessi e recuperi password per bloccare le minacce automatizzate.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: "Seleziona un fornitore di CAPTCHA e configura l'integrazione.",
      add: 'Aggiungi CAPTCHA',
    },
    settings: 'Impostazioni',
    captcha_required_flows: 'Flussi che richiedono CAPTCHA',
    sign_up: 'Registrati',
    sign_in: 'Accedi',
    forgot_password: 'Password dimenticata',
  },
  create_captcha: {
    setup_captcha: 'Configura CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Soluzione CAPTCHA di livello aziendale di Google che fornisce un rilevamento avanzato delle minacce e analisi di sicurezza dettagliate per proteggere il tuo sito web da attività fraudolente.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        "Alternativa intelligente di CAPTCHA di Cloudflare che offre protezione dai bot non invasiva assicurando un'esperienza utente senza puzzle visivi.",
    },
  },
  captcha_details: {
    back_to_security: 'Torna alla sicurezza',
    page_title: 'Dettagli CAPTCHA',
    check_readme: 'Controlla README',
    options_change_captcha: 'Cambia fornitore di CAPTCHA',
    connection: 'Connessione',
    description: 'Configura le connessioni captcha.',
    site_key: 'Chiave del sito',
    secret_key: 'Chiave segreta',
    project_id: 'ID del progetto',
    deletion_description: 'Sei sicuro di voler eliminare questo fornitore di CAPTCHA?',
    captcha_deleted: 'Fornitore di CAPTCHA eliminato con successo',
    setup_captcha: 'Configura CAPTCHA',
  },
};

export default Object.freeze(security);

const password_policy = {
  password_requirements: 'Requisiti per la password',
  minimum_length: 'Lunghezza minima',
  minimum_length_description: 'NIST consiglia di utilizzare almeno 8 caratteri per i prodotti web.',
  minimum_length_error: 'La lunghezza minima deve essere compresa tra {{min}} e {{max}} (inclusi).',
  minimum_required_char_types: 'Tipi di caratteri minimi richiesti',
  minimum_required_char_types_description:
    'Tipi di caratteri: maiuscole (A-Z), minuscole (a-z), numeri (0-9) e simboli speciali ({{symbols}}).',
  password_rejection: 'Rifiuto password',
  compromised_passwords: 'Rifiuta password compromesse',
  breached_passwords: 'Password violate',
  breached_passwords_description:
    'Rifiuta password trovate in precedenza nei database delle violazioni.',
  restricted_phrases: 'Limita frasi poco sicure',
  restricted_phrases_tooltip:
    'La tua password dovrebbe evitare queste frasi a meno che non le combiniate con 3 o più caratteri extra.',
  repetitive_or_sequential_characters: 'Caratteri ripetitivi o sequenziali',
  repetitive_or_sequential_characters_description: 'Ad esempio, "AAAA", "1234" e "abcd".',
  user_information: 'Informazioni utente',
  user_information_description:
    'Ad esempio, indirizzo email, numero di telefono, nome utente, ecc.',
  custom_words: 'Parole personalizzate',
  custom_words_description:
    'Personalizza parole specifiche del contesto, non case-sensitive, una per riga.',
  custom_words_placeholder: "Nome del tuo servizio, nome dell'azienda, ecc.",
};

const security = {
  page_title: 'Sicurezza',
  title: 'Sicurezza',
  subtitle: 'Configura una protezione avanzata contro attacchi sofisticati.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Politica password',
  },
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
    enable_captcha: 'Abilita CAPTCHA',
    enable_captcha_description:
      'Abilita la verifica CAPTCHA per i flussi di registrazione, accesso e recupero password.',
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
    recaptcha_key_id: 'ID chiave reCAPTCHA',
    recaptcha_api_key: 'Chiave API del progetto',
    deletion_description: 'Sei sicuro di voler eliminare questo fornitore di CAPTCHA?',
    captcha_deleted: 'Fornitore di CAPTCHA eliminato con successo',
    setup_captcha: 'Configura CAPTCHA',
  },
  password_policy,
};

export default Object.freeze(security);

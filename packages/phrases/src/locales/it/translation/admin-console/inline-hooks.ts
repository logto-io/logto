const inline_hooks = {
  page_title: 'Hook inline',
  title: 'Hook inline',
  subtitle:
    'Esegui codice personalizzato in punti specifici del flusso di autenticazione per estendere il comportamento di Logto.',
  status: {
    not_configured: 'Non configurato',
    configured: 'Configurato',
    enabled: 'Abilitato',
    disabled: 'Disabilitato',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Dopo la verifica del primo fattore',
      description:
        'Esegui logica personalizzata dopo la verifica del primo fattore di autenticazione e prima che l’accesso continui.',
    },
    post_sign_in: {
      name: 'Dopo l’accesso',
      description:
        'Esegui logica personalizzata dopo che un utente ha effettuato correttamente l’accesso.',
    },
  },
};

export default Object.freeze(inline_hooks);

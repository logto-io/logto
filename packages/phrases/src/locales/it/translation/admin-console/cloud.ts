const cloud = {
  general: {
    onboarding: 'Inizio',
  },
  create_tenant: {
    page_title: 'Crea tenant',
    title: 'Crea il tuo primo tenant',
    description:
      'Un tenant è un ambiente isolato in cui puoi gestire identità degli utenti, applicazioni e tutte le altre risorse di Logto.',
    invite_collaborators: 'Invita i tuoi collaboratori via email',
    hear_about_us: {
      title: 'Come hai sentito parlare di Logto per la prima volta?',
      detail_placeholder: 'Raccontaci di più (facoltativo)',
      options: {
        search_engine: 'Motore di ricerca (Google, Bing...)',
        ai_assistant: 'Assistente IA (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub o directory open source',
        friend_colleague: 'Un amico o collega',
        powered_by: "Pagina di accesso di un'app che utilizza Logto",
        content_social: 'Social media, articolo o video (YouTube, X, Reddit...)',
        other: 'Altro',
      },
    },
  },
  social_callback: {
    title: 'Accesso effettuato con successo',
    description:
      "Hai effettuato l'accesso con successo utilizzando il tuo account social. Per garantire integrazione senza problemi e accesso a tutte le funzionalità di Logto, ti consigliamo di procedere alla configurazione del tuo connettore social.",
    notice:
      'Evita di utilizzare il connettore demo per scopi di produzione. Una volta completato il test, ti invitiamo a eliminare il connettore demo e a configurare il tuo connettore con le tue credenziali.',
  },
  tenant: {
    create_tenant: 'Crea tenant',
  },
};

export default Object.freeze(cloud);

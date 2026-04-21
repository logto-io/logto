const oss_onboarding = {
  page_title: 'Onboarding',
  title: 'Raccontaci qualcosa di te',
  description:
    'Raccontaci qualcosa di te e del tuo progetto. Questo ci aiuta a rendere Logto migliore per tutti.',
  email: {
    label: 'Indirizzo email',
    description:
      'Useremo questo indirizzo se avremo bisogno di contattarti riguardo al tuo account.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Ricevi aggiornamenti sul prodotto, avvisi di sicurezza e contenuti selezionati da Logto.',
  project: {
    label: 'Uso Logto per',
    personal: 'Progetto personale',
    company: 'Progetto aziendale',
  },
  project_name: {
    label: 'Nome del progetto',
    placeholder: 'Il mio progetto',
  },
  company_name: {
    label: "Nome dell'azienda",
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Qual e la dimensione della tua azienda?',
  },
  errors: {
    email_required: "L'indirizzo email e obbligatorio",
    email_invalid: 'Inserisci un indirizzo email valido',
  },
};

export default Object.freeze(oss_onboarding);

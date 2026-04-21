const oss_onboarding = {
  page_title: 'Wprowadzenie',
  title: 'Opowiedz nam troche o sobie',
  description:
    'Opowiedz nam troche o sobie i swoim projekcie. To pomaga nam tworzyc lepsze Logto dla wszystkich.',
  email: {
    label: 'Adres e-mail',
    description:
      'Uzyjemy tego adresu, jesli bedziemy musieli skontaktowac sie z Toba w sprawie konta.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Otrzymuj aktualizacje produktu, powiadomienia bezpieczenstwa i wybrane tresci od Logto.',
  project: {
    label: 'Uzywam Logto do',
    personal: 'Projektu osobistego',
    company: 'Projektu firmowego',
  },
  project_name: {
    label: 'Nazwa projektu',
    placeholder: 'Moj projekt',
  },
  company_name: {
    label: 'Nazwa firmy',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Jaka jest wielkosc Twojej firmy?',
  },
  errors: {
    email_required: 'Adres e-mail jest wymagany',
    email_invalid: 'Wprowadz prawidlowy adres e-mail',
  },
};

export default Object.freeze(oss_onboarding);

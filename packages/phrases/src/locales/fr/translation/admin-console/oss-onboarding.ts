const oss_onboarding = {
  page_title: 'Onboarding',
  title: 'Parlez-nous un peu de vous',
  description:
    'Parlez-nous un peu de vous et de votre projet. Cela nous aide a ameliorer Logto pour tout le monde.',
  email: {
    label: 'Adresse e-mail',
    description:
      'Nous utiliserons cette adresse si nous devons vous contacter au sujet de votre compte.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Recevoir les mises a jour produit, les avis de securite et du contenu selectionne de Logto.',
  project: {
    label: "J'utilise Logto pour",
    personal: 'Projet personnel',
    company: "Projet d'entreprise",
  },
  project_name: {
    label: 'Nom du projet',
    placeholder: 'Mon projet',
  },
  company_name: {
    label: "Nom de l'entreprise",
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Quelle est la taille de votre entreprise ?',
  },
  errors: {
    email_required: "L'adresse e-mail est requise",
    email_invalid: 'Saisissez une adresse e-mail valide',
  },
};

export default Object.freeze(oss_onboarding);

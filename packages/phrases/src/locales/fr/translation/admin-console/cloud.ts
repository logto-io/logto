const cloud = {
  general: {
    onboarding: 'Intégration',
  },
  welcome: {
    page_title: 'Bienvenue',
    title: 'Bienvenue dans Logto Cloud ! Nous aimerions en savoir un peu plus sur vous.',
    description:
      'Personnalisons votre expérience Logto en vous connaissant mieux. Vos informations sont en sécurité avec nous.',
    project_field: "J'utilise Logto pour",
    project_options: {
      personal: 'Projet personnel',
      company: "Projet d'entreprise",
    },
    title_field: 'Votre titre',
    title_options: {
      developer: 'Développeur',
      team_lead: "Chef d'équipe",
      ceo: 'PDG',
      cto: 'CTO',
      product: 'Produit',
      others: 'Autres',
    },
    company_name_field: "Nom de l'entreprise",
    company_name_placeholder: 'Acme.co',
    company_size_field: 'Taille de votre entreprise',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: "Je m'inscris parce que",
    reason_options: {
      passwordless:
        "Je cherche une authentification sans mot de passe et une trousse d'interface utilisateur",
      efficiency: "Je cherche une infrastructure d'identité clé en main",
      access_control:
        "Je cherche à contrôler l'accès utilisateur en fonction des rôles et des responsabilités",
      multi_tenancy: 'Je cherche des stratégies pour un produit multi-tenant',
      enterprise: "Je cherche des solutions SSO pour une gestion de l'entreprise",
      others: 'Autres',
    },
  },

  sie: {
    page_title: "Personnalisez l'expérience de connexion",
    title: "Personnalisons d'abord votre expérience de connexion en toute simplicité",
    inspire: {
      title: 'Créez des exemples convaincants',
      description:
        'Vous vous sentez incertain de l\'expérience de connexion? Cliquez simplement sur "Inspirez-moi" et laissez la magie opérer!',
      inspire_me: 'Inspirez-moi',
    },
    logo_field: "Logo de l'application",
    color_field: 'Couleur de la marque',
    identifier_field: 'Identifiant',
    identifier_options: {
      email: 'Email',
      phone: 'Téléphone',
      user_name: "Nom d'utilisateur",
    },
    authn_field: 'Authentification',
    authn_options: {
      password: 'Mot de passe',
      verification_code: 'Code de vérification',
    },
    social_field: 'Connexion sociale',
    finish_and_done: 'Terminer et terminé',
    preview: {
      mobile_tab: 'Mobile',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Débloqué ultérieurement',
      unlocked_later_tip:
        "Une fois que vous avez terminé le processus d'inscription et que vous êtes entré dans le produit, vous aurez accès à encore plus de méthodes de connexion sociale.",
      notice:
        "Veuillez éviter d'utiliser le connecteur de démonstration à des fins de production. Lorsque vous avez terminé les tests, veuillez supprimer le connecteur de démonstration et mettre en place votre propre connecteur avec vos informations d'identification.",
    },
  },
  socialCallback: {
    title: 'Connexion réussie',
    description:
      'Vous vous êtes connecté avec succès en utilisant votre compte social. Pour assurer une intégration fluide et accéder à toutes les fonctionnalités de Logto, nous vous recommandons de configurer votre propre connecteur social.',
  },
  tenant: {
    create_tenant: 'Créer un locataire',
  },
};

export default cloud;

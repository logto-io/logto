const cloud = {
  welcome: {
    page_title: 'Bienvenue',
    title: 'Bienvenue et créons votre propre aperçu cloud de Logto',
    description:
      'Que vous soyez un utilisateur open-source ou cloud, faites une visite de la vitrine et découvrez la valeur totale de Logto. Le Cloud Preview sert également de version préliminaire de Logto Cloud.',
    project_field: 'J’utilise Logto pour',
    project_options: {
      personal: 'Projet personnel',
      company: "Projet d'entreprise",
    },
    deployment_type_field: 'Vous préférez open-source ou cloud?',
    deployment_type_options: {
      open_source: 'Open-Source',
      cloud: 'Cloud',
    },
  },
  about: {
    page_title: 'Un peu à propos de vous',
    title: 'Un peu à propos de vous',
    description:
      'Personnalisons votre expérience Logto en vous connaissant mieux. Vos informations sont en sécurité avec nous.',
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
  congrats: {
    page_title: 'Gagnez des crédits tôt',
    title: 'Bonne nouvelle! Vous êtes éligible pour gagner des crédits anticipés de Logto Cloud!',
    description:
      "Ne manquez pas l'occasion de profiter d'un abonnement gratuit de <strong>60 jours</strong> pour Logto Cloud après son lancement officiel! Contactez l'équipe Logto dès maintenant pour en savoir plus.",
    check_out_button: "Découvrez l'aperçu en direct",
    reserve_title: "Réservez votre temps avec l'équipe Logto",
    reserve_description: "Le crédit n'est éligible qu'après validation.",
    book_button: 'Planifier maintenant',
    join_description:
      "Rejoignez notre <a>{{link}}</a> public pour vous connecter et discuter avec d'autres développeurs.",
    discord_link: 'canal Discord',
    enter_admin_console: 'Accédez à Logto Cloud Preview',
  },
  gift: {
    title:
      'Utilisez Logto Cloud gratuitement pendant 60 jours. Joignez-vous aux pionniers dès maintenant!',
    description: 'Réservez une session individuelle avec notre équipe pour un crédit préalable.',
    reserve_title: "Réservez votre temps avec l'équipe Logto",
    reserve_description: "Le crédit n'est éligible qu'après évaluation.",
    book_button: 'Réserver',
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
  broadcast: '📣 Vous êtes dans Logto Cloud (aperçu)',
  socialCallback: {
    title: 'Connexion réussie',
    description:
      'Vous vous êtes connecté avec succès en utilisant votre compte social. Pour assurer une intégration fluide et accéder à toutes les fonctionnalités de Logto, nous vous recommandons de configurer votre propre connecteur social.',
  },
};

export default cloud;

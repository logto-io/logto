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
    company_name_field: "Nom de l'entreprise",
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
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

export default Object.freeze(cloud);

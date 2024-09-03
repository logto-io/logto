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
    stage_field: 'Dans quelle étape se trouve actuellement votre produit?',
    stage_options: {
      new_product: "Démarrer un nouveau projet et chercher une solution rapide et prête à l'emploi",
      existing_product:
        "Migrer à partir d'une authentification actuelle (par exemple, auto-construite, Auth0, Cognito, Microsoft)",
      target_enterprise_ready:
        'Je viens de conclure des contrats avec des clients plus importants et je veux maintenant rendre mon produit prêt à être vendu aux entreprises',
    },
    additional_features_field: "Avez-vous d'autres informations à nous communiquer?",
    additional_features_options: {
      customize_ui_and_flow:
        'Construire et gérer ma propre interface utilisateur, pas seulement utiliser la solution pré-construite et personnalisable de Logto',
      compliance: 'SOC2 et le respect du RGPD sont indispensables',
      export_user_data:
        "Besoin de la possibilité d'exporter des données utilisateur à partir de Logto",
      budget_control: 'Je dois avoir un contrôle de budget très strict',
      bring_own_auth:
        "J'ai mes propres services d'authentification et j'ai juste besoin de certaines fonctionnalités de Logto",
      others: 'Aucun de ceux mentionnés ci-dessus',
    },
  },
  create_tenant: {
    page_title: 'Créer un locataire',
    title: 'Créez votre premier locataire',
    description:
      'Un locataire est un environnement isolé où vous pouvez gérer les identités des utilisateurs, les applications et toutes les autres ressources Logto.',
    invite_collaborators: 'Invitez vos collaborateurs par e-mail',
  },
  sie: {
    page_title: "Personnalisez l'expérience de connexion",
    title: "Personnalisons d'abord votre expérience de connexion en toute simplicité",
    inspire: {
      title: 'Créez des exemples convaincants',
      description:
        'Vous vous sentez incertain de l\'expérience de connexion ? Cliquez simplement sur "Inspirez-moi" et laissez la magie opérer!',
      inspire_me: 'Inspirez-moi',
    },
    logo_field: "Logo de l'application",
    color_field: 'Couleur de la marque',
    identifier_field: 'Identifiant',
    identifier_options: {
      email: 'E-mail',
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

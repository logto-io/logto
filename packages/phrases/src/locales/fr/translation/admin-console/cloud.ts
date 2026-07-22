const cloud = {
  general: {
    onboarding: 'Intégration',
  },
  create_tenant: {
    page_title: 'Créer un locataire',
    title: 'Créez votre premier locataire',
    description:
      'Un locataire est un environnement isolé où vous pouvez gérer les identités des utilisateurs, les applications et toutes les autres ressources Logto.',
    invite_collaborators: 'Invitez vos collaborateurs par e-mail',
    hear_about_us: {
      title: 'Comment avez-vous entendu parler de Logto pour la première fois ?',
      detail_placeholder: 'Dites-nous en plus (facultatif)',
      options: {
        search_engine: 'Moteur de recherche (Google, Bing...)',
        ai_assistant: 'Assistant IA (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub ou annuaires open source',
        friend_colleague: 'Un ami ou un collègue',
        powered_by: "Page de connexion d'une application utilisant Logto",
        content_social: 'Réseaux sociaux, article ou vidéo (YouTube, X, Reddit...)',
        other: 'Autre',
      },
    },
  },
  social_callback: {
    title: 'Connexion réussie',
    description:
      'Vous vous êtes connecté avec succès en utilisant votre compte social. Pour assurer une intégration fluide et accéder à toutes les fonctionnalités de Logto, nous vous recommandons de configurer votre propre connecteur social.',
    notice:
      "Veuillez éviter d'utiliser le connecteur de démonstration à des fins de production. Une fois que vous aurez terminé les tests, veuillez supprimer le connecteur de démonstration et configurer votre propre connecteur avec vos identifiants.",
  },
  tenant: {
    create_tenant: 'Créer un locataire',
  },
};

export default Object.freeze(cloud);

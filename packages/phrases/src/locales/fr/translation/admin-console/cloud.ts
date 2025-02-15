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
  },
  social_callback: {
    title: 'Connexion réussie',
    description:
      'Vous vous êtes connecté avec succès en utilisant votre compte social. Pour assurer une intégration fluide et accéder à toutes les fonctionnalités de Logto, nous vous recommandons de configurer votre propre connecteur social.',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Créer un locataire',
  },
};

export default Object.freeze(cloud);

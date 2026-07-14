const inline_hooks = {
  page_title: 'Hooks inline',
  title: 'Hooks inline',
  subtitle:
    'Exécutez du code personnalisé à des étapes précises du flux d’authentification pour étendre le comportement de Logto.',
  status: {
    not_configured: 'Non configuré',
    configured: 'Configuré',
    enabled: 'Activé',
    disabled: 'Désactivé',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'Après la vérification du premier facteur',
      description:
        'Exécutez une logique personnalisée après la vérification du premier facteur d’authentification et avant la poursuite de la connexion.',
    },
    post_sign_in: {
      name: 'Après la connexion',
      description:
        'Exécutez une logique personnalisée après la connexion réussie d’un utilisateur.',
    },
  },
};

export default Object.freeze(inline_hooks);

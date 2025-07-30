const user_identity_details = {
  social_identity_page_title: "Détails de l'identité sociale",
  back_to_user_details: "Retour aux détails de l'utilisateur",
  delete_identity: `Supprimer la connexion d'identité`,
  social_account: {
    title: 'Compte social',
    description:
      'Voir les données utilisateur et les informations de profil synchronisées à partir du compte {{connectorName}} lié.',
    provider_name: "Nom du fournisseur d'identité sociale",
    identity_id: "ID de l'identité sociale",
    user_profile: "Profil utilisateur synchronisé à partir du fournisseur d'identité sociale",
  },
  sso_account: {
    title: "Compte SSO d'entreprise",
    description:
      'Voir les données utilisateur et les informations de profil synchronisées à partir du compte {{connectorName}} lié.',
    provider_name: "Nom du fournisseur d'identité SSO d'entreprise",
    identity_id: "ID de l'identité SSO d'entreprise",
    user_profile:
      "Profil utilisateur synchronisé à partir du fournisseur d'identité SSO d'entreprise",
  },
  token_storage: {
    title: "Jeton d'accès",
    description:
      "Stocker les jetons d'accès et de rafraîchissement de {{connectorName}} dans le Coffre Secret. Permet des appels API automatisés sans consentement utilisateur répété.",
  },
  access_token: {
    title: "Jeton d'accès",
    description_active:
      "Le jeton d'accès est actif et stocké en toute sécurité dans le Coffre Secret. Votre produit peut l'utiliser pour accéder aux API de {{connectorName}}.",
    description_inactive:
      "Ce jeton d'accès est inactif (par exemple, révoqué). Les utilisateurs doivent réautoriser l'accès pour restaurer la fonctionnalité.",
    description_expired:
      "Ce jeton d'accès a expiré. Le renouvellement se produit automatiquement lors de la prochaine requête API utilisant le jeton de rafraîchissement. Si le jeton de rafraîchissement n'est pas disponible, une réauthentification de l'utilisateur est requise.",
  },
  refresh_token: {
    available:
      "Le jeton de rafraîchissement est disponible. Si le jeton d'accès expire, il sera automatiquement rafraîchi en utilisant le jeton de rafraîchissement.",
    not_available:
      "Le jeton de rafraîchissement n'est pas disponible. Après l'expiration du jeton d'accès, les utilisateurs doivent se réauthentifier pour obtenir de nouveaux jetons.",
  },
  token_status: 'Statut du jeton',
  created_at: 'Créé à',
  updated_at: 'Mise à jour à',
  expires_at: 'Expire à',
  scopes: 'Périmètres',
  delete_tokens: {
    title: 'Supprimer les jetons',
    description:
      "Supprimer les jetons stockés. Les utilisateurs doivent réautoriser l'accès pour restaurer la fonctionnalité.",
    confirmation_message:
      "Êtes-vous sûr de vouloir supprimer les jetons ? Le Coffre Secret de Logto supprimera les jetons d'accès et de rafraîchissement {{connectorName}} stockés. Cet utilisateur doit réautoriser pour restaurer l'accès aux API de {{connectorName}}.",
  },
  token_storage_disabled: {
    title: 'Le stockage des jetons est désactivé pour ce connecteur',
    description:
      'Les utilisateurs peuvent actuellement utiliser {{connectorName}} uniquement pour se connecter, lier des comptes ou synchroniser des profils lors de chaque flux de consentement. Pour accéder aux API de {{connectorName}} et effectuer des actions au nom des utilisateurs, veuillez activer le stockage des jetons dans',
  },
};

export default Object.freeze(user_identity_details);

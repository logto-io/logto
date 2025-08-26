const usage = {
  status_active: "En cours d'utilisation",
  status_inactive: 'Non utilisé',
  limited_status_quota_description: '(Première {{quota}} incluse)',
  unlimited_status_quota_description: '(Inclus)',
  disabled_status_quota_description: '(Non inclus)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Illimité)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (Première {{basicQuota}} incluse)</span>',
  usage_description_without_quota: '{{usage}}<span> (Non inclus)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Un MAU est un utilisateur unique qui a échangé au moins un jeton avec Logto pendant un cycle de facturation. Illimité pour le plan Pro. <a>En savoir plus</a>',
    tooltip_for_enterprise:
      'Un MAU est un utilisateur unique qui a échangé au moins un jeton avec Logto pendant un cycle de facturation. Illimité pour le plan Entreprise.',
  },
  organizations: {
    title: 'Organisations',
    tooltip:
      "Fonctionnalité en supplément à un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre d'organisations ou leur niveau d'activité.",
    description_for_enterprise: '(Inclus)',
    tooltip_for_enterprise:
      "L'inclusion dépend de votre plan. Si la fonctionnalité d'organisation n'est pas dans votre contrat initial, elle sera ajoutée à votre facture lorsque vous l'activerez. Le complément coûte ${{price, number}}/mois, indépendamment du nombre d'organisations ou de leur activité.",
    tooltip_for_enterprise_with_numbered_basic_quota:
      "Votre plan inclut les {{basicQuota}} premières organisations gratuitement. Si vous en avez besoin de plus, vous pouvez les ajouter avec le complément d'organisation à un tarif fixe de ${{price, number}} par mois, indépendamment du nombre d'organisations ou de leur niveau d'activité.",
  },
  mfa: {
    title: 'MFA',
    tooltip:
      "Fonctionnalité en supplément à un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre de facteurs d'authentification utilisés.",
    tooltip_for_enterprise:
      "L'inclusion dépend de votre plan. Si la fonctionnalité MFA n'est pas dans votre contrat initial, elle sera ajoutée à votre facture lorsque vous l'activerez. Le complément coûte ${{price, number}}/mois, indépendamment du nombre de facteurs d'authentification utilisés.",
  },
  enterprise_sso: {
    title: "SSO d'entreprise",
    tooltip:
      'Fonctionnalité en supplément avec un prix de ${{price, number}} par connexion SSO par mois.',
    tooltip_for_enterprise:
      'Fonctionnalité supplémentaire avec un prix de ${{price, number}} par connexion SSO par mois. Les {{basicQuota}} premières SSO sont incluses et gratuites dans votre plan basé sur un contrat.',
  },
  api_resources: {
    title: 'Ressources API',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par ressource par mois. Les 3 premières ressources API sont gratuites.',
    tooltip_for_enterprise:
      'Les {{basicQuota}} premières ressources API sont incluses et gratuites dans votre plan basé sur un contrat. Si vous en avez besoin de plus, ${{price, number}} par ressource API par mois.',
  },
  machine_to_machine: {
    title: 'Machine à machine',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par application par mois. La première application machine à machine est gratuite.',
    tooltip_for_enterprise:
      'La première application machine à machine {{basicQuota}} est gratuite dans votre plan basé sur un contrat. Si vous en avez besoin de plus, ${{price, number}} par application par mois.',
  },
  tenant_members: {
    title: 'Membres du locataire',
    tooltip:
      'Fonctionnalité supplémentaire au prix de ${{price, number}} par membre par mois. Les {{count}} premiers membres du locataire sont gratuits.',
    tooltip_one:
      'Fonctionnalité supplémentaire au prix de ${{price, number}} par membre par mois. Le premier membre du locataire est gratuit.',
    tooltip_other:
      'Fonctionnalité supplémentaire au prix de ${{price, number}} par membre par mois. Les {{count}} premiers membres du locataire sont gratuits.',
    tooltip_for_enterprise:
      'Les {{basicQuota}} premiers membres du locataire sont inclus et gratuits dans votre plan basé sur un contrat. Si vous en avez besoin de plus, ${{price, number}} par membre du locataire par mois.',
  },
  tokens: {
    title: 'Jetons',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par {{tokenLimit}} de jetons. Le premier {{basicQuota}} de jetons est inclus.',
    tooltip_for_enterprise:
      'Le premier {{basicQuota}} de jetons est inclus et gratuit dans votre plan basé sur un contrat. Si vous en avez besoin de plus, ${{price, number}} par {{tokenLimit}} jetons par mois.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par hook. Les 10 premiers hooks sont inclus.',
    tooltip_for_enterprise:
      'Les {{basicQuota}} premiers hooks sont inclus et gratuits dans votre plan basé sur un contrat. Si vous en avez besoin de plus, ${{price, number}} par hook par mois.',
  },
  security_features: {
    title: 'Sécurité avancée',
    tooltip:
      'Fonctionnalité supplémentaire avec un prix de ${{price, number}}/mois pour le pack complet de sécurité avancée, incluant CAPTCHA, verrouillage des identifiants, liste de blocage des e-mails, et plus.',
  },
  saml_applications: {
    title: 'Application SAML',
    tooltip:
      'Fonctionnalité supplémentaire au prix de ${{price, number}} par application SAML par mois. ',
  },
  third_party_applications: {
    title: 'Application tierce',
    tooltip:
      'Fonctionnalité supplémentaire au prix de ${{price, number}} par application par mois.',
  },
  rbacEnabled: {
    title: 'Rôles',
    tooltip:
      "Fonctionnalité supplémentaire avec un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre de rôles globaux.",
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      "Si vous effectuez des modifications pendant le cycle de facturation actuel, votre prochaine facture peut être légèrement plus élevée pour le premier mois suivant la modification. Elle sera de ${{price, number}} prix de base plus le coût des fonctionnalités en supplément pour l'utilisation non facturée du cycle actuel et la charge complète pour le cycle suivant. <a>En savoir plus</a>",
  },
};

export default Object.freeze(usage);

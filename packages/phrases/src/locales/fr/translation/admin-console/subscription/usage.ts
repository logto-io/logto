const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Un MAU est un utilisateur unique qui a échangé au moins un jeton avec Logto pendant un cycle de facturation. Illimité pour le plan Pro. <a>En savoir plus</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organisations',
    tooltip:
      "Fonctionnalité en supplément à un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre d'organisations ou leur niveau d'activité.",
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      "Fonctionnalité en supplément à un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre de facteurs d'authentification utilisés.",
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: "SSO d'entreprise",
    tooltip:
      'Fonctionnalité en supplément avec un prix de ${{price, number}} par connexion SSO par mois.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'Ressources API',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par ressource par mois. Les 3 premières ressources API sont gratuites.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Machine à machine',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par application par mois. La première application machine à machine est gratuite.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Membres du locataire',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par membre par mois. Les 3 premiers membres du locataire sont gratuits.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Jetons',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par {{tokenLimit}} de jetons. Le premier {{basicQuota}} de jetons est inclus.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par hook. Les 10 premiers hooks sont inclus.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      "Si vous effectuez des modifications pendant le cycle de facturation actuel, votre prochaine facture peut être légèrement plus élevée pour le premier mois suivant la modification. Elle sera de ${{price, number}} prix de base plus le coût des fonctionnalités en supplément pour l'utilisation non facturée du cycle actuel et la charge complète pour le cycle suivant. <a>En savoir plus</a>",
  },
};

export default Object.freeze(usage);

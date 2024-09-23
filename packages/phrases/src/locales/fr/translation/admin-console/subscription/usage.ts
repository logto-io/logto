const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Un MAU est un utilisateur unique qui a échangé au moins un jeton avec Logto pendant un cycle de facturation. Illimité pour le plan Pro. <a>En savoir plus</a>',
  },
  organizations: {
    title: 'Organisations',
    description: '{{usage}}',
    tooltip:
      "Fonctionnalité en supplément à un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre d'organisations ou leur niveau d'activité.",
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      "Fonctionnalité en supplément à un tarif fixe de ${{price, number}} par mois. Le prix n'est pas affecté par le nombre de facteurs d'authentification utilisés.",
  },
  enterprise_sso: {
    title: "SSO d'entreprise",
    description: '{{usage}}',
    tooltip:
      'Fonctionnalité en supplément avec un prix de ${{price, number}} par connexion SSO par mois.',
  },
  api_resources: {
    title: 'Ressources API',
    description: '{{usage}} <span>(Gratuit pour les 3 premiers)</span>',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par ressource par mois. Les 3 premières ressources API sont gratuites.',
  },
  machine_to_machine: {
    title: 'Machine à machine',
    description: '{{usage}} <span>(Gratuit pour le premier)</span>',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par application par mois. La première application machine à machine est gratuite.',
  },
  tenant_members: {
    title: 'Membres du locataire',
    description: '{{usage}} <span>(Gratuit pour les 3 premiers)</span>',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par membre par mois. Les 3 premiers membres du locataire sont gratuits.',
  },
  tokens: {
    title: 'Jetons',
    description: '{{usage}}',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par million de jetons. Le premier million de jetons est inclus.',
  },
  hooks: {
    title: 'Hooks',
    description: '{{usage}} <span>(Gratuit pour les 10 premiers)</span>',
    tooltip:
      'Fonctionnalité en supplément au prix de ${{price, number}} par hook. Les 10 premiers hooks sont inclus.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      "Si vous effectuez des modifications pendant le cycle de facturation actuel, votre prochaine facture peut être légèrement plus élevée pour le premier mois suivant la modification. Elle sera de ${{price, number}} prix de base plus le coût des fonctionnalités en supplément pour l'utilisation non facturée du cycle actuel et la charge complète pour le cycle suivant. <a>En savoir plus</a>",
  },
};

export default Object.freeze(usage);

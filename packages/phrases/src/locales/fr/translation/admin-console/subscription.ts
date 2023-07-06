const subscription = {
  free_plan: 'Plan gratuit',
  free_plan_description:
    'Pour les projets secondaires et les essais initiaux de Logto. Pas de carte de crédit.',
  hobby_plan: 'Plan loisir',
  hobby_plan_description:
    'Pour les développeurs individuels ou les environnements de développement.',
  pro_plan: 'Plan Pro',
  pro_plan_description: "Pour les entreprises bénéficient d'une tranquillité d'esprit avec Logto.",
  enterprise: 'Entreprise',
  current_plan: 'Plan actuel',
  current_plan_description:
    "Il s'agit de votre plan actuel. Vous pouvez consulter l'utilisation du plan, votre prochaine facture et passer à un plan de niveau supérieur si vous le souhaitez.",
  plan_usage: 'Utilisation du plan',
  plan_cycle: "Cycle du plan : {{period}}. L'utilisation est renouvelée le {{renewDate}}.",
  next_bill: 'Votre prochaine facture',
  next_bill_hint: 'Pour en savoir plus sur le calcul, veuillez vous référer à cet <a>article</a>.',
  next_bill_tip:
    'Votre prochaine facture comprend le prix de base de votre plan pour le mois prochain, ainsi que le coût de votre utilisation multiplié par le prix unitaire MAU dans divers niveaux.',
  manage_payment: 'Gérer le paiement',
  overfill_quota_warning:
    'Vous avez atteint votre limite de quota. Pour éviter tout problème, passez à un plan supérieur.',
  upgrade_pro: 'Passer à la version Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Problème de paiement détecté. Impossible de traiter ${{price, number}} pour le cycle précédent. Mettez à jour le paiement pour éviter la suspension du service Logto.',
  downgrade: 'Rétrograder',
  current: 'Actuel',
  buy_now: 'Acheter maintenant',
  contact_us: 'Contactez-nous',
  quota_table: {
    quota: {
      title: 'Quota',
      tenant_limit: 'Limite du locataire',
      base_price: 'Prix de base',
      mau_unit_price: '* Prix unitaire MAU',
      mau_limit: 'Limite de MAU',
    },
    application: {
      title: 'Applications',
      total: 'Total',
      m2m: 'Machine à machine',
    },
    resource: {
      title: "Ressources d'API",
      resource_count: 'Nombre de ressources',
      scopes_per_resource: 'Autorisations par ressource',
    },
    branding: {
      title: 'Branding',
      custom_domain: 'Domaine personnalisé',
    },
    user_authn: {
      title: "Authentification de l'utilisateur",
      omni_sign_in: 'Connexion omni',
      built_in_email_connector: 'Connecteur e-mail intégré',
      social_connectors: 'Connecteurs sociaux',
      standard_connectors: 'Connecteurs standard',
    },
    roles: {
      title: 'Rôles',
      roles: 'Rôles',
      scopes_per_role: 'Autorisations par rôle',
    },
    audit_logs: {
      title: "Journal d'audit",
      retention: 'Durée de conservation',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Montant',
    },
    support: {
      title: 'Support',
      community: 'Communauté',
      customer_ticket: 'Ticket client',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      "* Nos prix unitaires peuvent varier en fonction des ressources réellement consommées et Logto se réserve le droit d'expliquer toute modification des prix unitaires.",
    unlimited: 'Illimité',
    contact: 'Contact',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/mois',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '1 jour',
    days_other: '{{count, number}} jours',
    add_on: 'Module complémentaire',
  },
  downgrade_form: {
    allowed_title: 'Êtes-vous sûr de vouloir rétrograder ?',
    allowed_description:
      "En rétrogradant vers le {{plan}}, vous n'aurez plus accès aux avantages suivants.",
    not_allowed_title: "Vous n'êtes pas éligible pour la rétrogradation",
    not_allowed_description:
      'Assurez-vous de respecter les normes suivantes avant de rétrograder vers le {{plan}}. Une fois que vous aurez réconcilié et rempli les exigences, vous serez éligible pour la rétrogradation.',
    confirm_downgrade: 'Rétrograder quand même',
  },
};

export default subscription;

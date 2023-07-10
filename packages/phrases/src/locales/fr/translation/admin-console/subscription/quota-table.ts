const quota_table = {
  quota: {
    title: 'Quota',
    tenant_limit: 'Limite du locataire',
    base_price: 'Prix de base',
    mau_unit_price: '* Prix unitaire MAU',
    mau_limit: 'Limite MAU',
  },
  application: {
    title: 'Applications',
    total: 'Total',
    m2m: 'Machine à machine',
  },
  resource: {
    title: 'API resources',
    resource_count: 'Nombre de ressources',
    scopes_per_resource: 'Autorisations par ressource',
  },
  branding: {
    title: 'Branding',
    custom_domain: 'Domaine personnalisé',
  },
  user_authn: {
    title: 'Authentification utilisateur',
    omni_sign_in: 'Connexion omni',
    built_in_email_connector: 'Connecteur de messagerie intégré',
    social_connectors: 'Connecteurs sociaux',
    standard_connectors: 'Connecteurs standards',
  },
  roles: {
    title: 'Rôles',
    roles: 'Rôles',
    scopes_per_role: 'Autorisations par rôle',
  },
  audit_logs: {
    title: 'Journaux d’audit',
    retention: 'Conservation',
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
    '* Nos prix unitaires peuvent varier en fonction des ressources réellement consommées, et Logto se réserve le droit d’expliquer tout changement de prix unitaire.',
  unlimited: 'Illimité',
  contact: 'Contact',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mois',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} jour',
  days_other: '{{count, number}} jours',
  add_on: 'Complément',
};

export default quota_table;

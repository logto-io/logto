const quota_table = {
  quota: {
    title: 'Quota',
    tenant_limit: 'Limite de locataire',
    base_price: 'Prix de base',
    mau_unit_price: '* Prix unitaire MAU',
    mau_limit: 'Limite MAU',
  },
  application: {
    title: 'Applications',
    total: 'Total des applications',
    m2m: 'Machine-à-machine',
  },
  resource: {
    title: 'Ressources API',
    resource_count: 'Nombre de ressources',
    scopes_per_resource: 'Autorisations par ressource',
  },
  branding: {
    title: 'Interface utilisateur et branding',
    custom_domain: 'Domaine personnalisé',
    custom_css: 'CSS personnalisé',
    app_logo_and_favicon: "Logo et favicon de l'application",
    dark_mode: 'Mode sombre',
    i18n: 'Internationalisation',
  },
  user_authn: {
    title: 'Authentification des utilisateurs',
    omni_sign_in: 'Connexion omnicanale',
    password: 'Mot de passe',
    passwordless: 'Sans mot de passe - Email et SMS',
    email_connector: 'Connecteur email',
    sms_connector: 'Connecteur SMS',
    social_connectors: 'Connecteurs sociaux',
    standard_connectors: 'Connecteurs standards',
    built_in_email_connector: 'Connecteur email intégré',
    mfa: 'MFA',
    sso: 'SSO entreprise',
  },
  user_management: {
    title: 'Gestion des utilisateurs',
    user_management: 'Gestion des utilisateurs',
    roles: 'Rôles',
    scopes_per_role: 'Autorisations par rôle',
  },
  audit_logs: {
    title: "Journaux d'audit",
    retention: 'Conservation',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organizations: {
    title: 'Organisation',
    /** UNTRANSLATED */
    organizations: 'Organizations',
    /** UNTRANSLATED */
    monthly_active_organization: 'Monthly active organization',
    /** UNTRANSLATED */
    allowed_users_per_org: 'Allowed users per org',
    /** UNTRANSLATED */
    invitation: 'Invitation (Coming soon)',
    /** UNTRANSLATED */
    org_roles: 'Org roles',
    /** UNTRANSLATED */
    org_permissions: 'Org permissions',
    /** UNTRANSLATED */
    just_in_time_provisioning: 'Just-in-time provisioning',
  },
  support: {
    title: 'Support',
    community: 'Communauté',
    customer_ticket: 'Ticket de support',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Vos utilisateurs actifs mensuels (MAU) sont répartis en 3 niveaux en fonction de la fréquence à laquelle ils se connectent pendant le cycle de facturation. Chaque niveau a un prix différent par unité MAU.',
  unlimited: 'Illimité',
  contact: 'Contact',
  monthly_price: '${{value, number}}/mo',
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} jour',
  days_other: '{{count, number}} jours',
  add_on: 'Module complémentaire',
  tier: 'Niveau{{value, number}}: ',
  /** UNTRANSLATED */
  free_token_limit_tip: 'Free for {{value}}M token issued.',
  /** UNTRANSLATED */
  paid_token_limit_tip:
    'Free for {{value}}M token issued. We may add charges if you go beyond {{value}}M tokens once we finalize the prices.',
  /** UNTRANSLATED */
  paid_quota_limit_tip:
    'We may add charges for features that go beyond your quota limit as add-ons once we finalize the prices.',
  /** UNTRANSLATED */
  beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the add-on pricing.',
  /** UNTRANSLATED */
  beta: 'Beta',
  /** UNTRANSLATED */
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);

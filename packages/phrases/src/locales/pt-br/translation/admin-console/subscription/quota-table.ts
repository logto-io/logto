const quota_table = {
  quota: {
    title: 'Cota',
    tenant_limit: 'Limite de inquilino',
    base_price: 'Preço base',
    mau_unit_price: '* Preço unitário de MAU',
    mau_limit: 'Limite de MAU',
  },
  application: {
    title: 'Aplicações',
    total: 'Total de aplicações',
    m2m: 'Aplicação máquina-a-máquina',
  },
  resource: {
    title: 'Recursos de API',
    resource_count: 'Contagem de recursos',
    scopes_per_resource: 'Permissões por recurso',
  },
  branding: {
    title: 'Interface de usuário e branding',
    custom_domain: 'Domínio personalizado',
    custom_css: 'CSS personalizado',
    app_logo_and_favicon: 'Logotipo da aplicação e favicon',
    dark_mode: 'Modo escuro',
    i18n: 'Internacionalização',
  },
  user_authn: {
    title: 'Autenticação de usuário',
    omni_sign_in: 'Enterprise SSO (Q4, 2023)',
    password: 'Senha',
    passwordless: 'Sem senha - E-mail e SMS',
    email_connector: 'Conector de e-mail',
    sms_connector: 'Conector de SMS',
    social_connectors: 'Conectores sociais',
    standard_connectors: 'Conectores padrão',
    built_in_email_connector: 'Conector de e-mail integrado',
    mfa: 'MFA',
  },
  user_management: {
    title: 'Gerenciamento de usuários',
    user_management: 'Gerenciamento de usuários',
    roles: 'Funções',
    scopes_per_role: 'Permissões por função',
  },
  audit_logs: {
    title: 'Registros de auditoria',
    retention: 'Retenção',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organization: {
    title: 'Organização',
    organization: 'Organização (Q4, 2023)',
  },
  support: {
    title: 'Suporte',
    community: 'Comunidade',
    customer_ticket: 'Ticket de suporte',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Seus usuários ativos mensais (MAU) são divididos em 3 níveis com base em quantas vezes eles fazem login durante o ciclo de faturamento. Cada nível tem um preço diferente por unidade de MAU.',
  unlimited: 'Ilimitado',
  contact: 'Contato',
  monthly_price: '${ { value, number } }/mês',
  mau_price: '${ { value, number } }/MAU',
  days_one: '${ { count, number } } dia',
  days_other: '${ { count, number } } dias',
  add_on: 'Adicional',
  tier: 'Nível${ { value, number } }: ',
};

export default Object.freeze(quota_table);

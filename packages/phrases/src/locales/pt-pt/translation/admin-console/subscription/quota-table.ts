const quota_table = {
  quota: {
    title: 'Quota',
    tenant_limit: 'Limite do inquilino',
    base_price: 'Preço base',
    mau_unit_price: '* Preço unitário do MAU',
    mau_limit: 'Limite do MAU',
  },
  application: {
    title: 'Aplicações',
    total: 'Total',
    m2m: 'Máquina a máquina',
  },
  resource: {
    title: 'Recursos da API',
    resource_count: 'Contagem de recursos',
    scopes_per_resource: 'Permissão por recurso',
  },
  branding: {
    title: 'Marca',
    custom_domain: 'Domínio personalizado',
  },
  user_authn: {
    title: 'Autenticação do usuário',
    omni_sign_in: 'Omni sign-in',
    built_in_email_connector: 'Conector de e-mail incorporado',
    social_connectors: 'Conectores sociais',
    standard_connectors: 'Conectores padrão',
  },
  roles: {
    title: 'Funções',
    roles: 'Funções',
    scopes_per_role: 'Permissão por função',
  },
  audit_logs: {
    title: 'Registos de Auditoria',
    retention: 'Retenção',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Quantidade',
  },
  support: {
    title: 'Suporte',
    community: 'Comunidade',
    customer_ticket: 'Bilhete de cliente',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Nossos preços unitários podem variar de acordo com os recursos reais consumidos, e a Logto reserva-se o direito de explicar quaisquer alterações nos preços unitários.',
  unlimited: 'Ilimitado',
  contact: 'Contacto',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mês',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} dia',
  days_other: '{{count, number}} dias',
  add_on: 'Adicionar',
};

export default quota_table;

const quota_table = {
  quota: {
    title: 'Cota',
    tenant_limit: 'Limite de locatários',
    base_price: 'Preço base',
    mau_unit_price: '* Preço unitário do MAU',
    mau_limit: 'Limite de MAU',
  },
  application: {
    title: 'Aplicações',
    total: 'Total',
    m2m: 'Máquina para máquina',
  },
  resource: {
    title: 'Recursos da API',
    resource_count: 'Contagem de recursos',
    scopes_per_resource: 'Permissões por recurso',
  },
  branding: {
    title: 'Marca',
    custom_domain: 'Domínio personalizado',
  },
  user_authn: {
    title: 'Autenticação de usuário',
    omni_sign_in: 'Omni sign-in',
    built_in_email_connector: 'Conector de e-mail incorporado',
    social_connectors: 'Conectores sociais',
    standard_connectors: 'Conectores padrão',
  },
  roles: {
    title: 'Funções',
    roles: 'Funções',
    scopes_per_role: 'Permissões por função',
  },
  audit_logs: {
    title: 'Logs de auditoria',
    retention: 'Retenção',
  },
  hooks: {
    title: 'Hooks',
    amount: 'Quantidade',
  },
  support: {
    title: 'Suporte',
    community: 'Comunidade',
    customer_ticket: 'Ticket do cliente',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Nossos preços unitários podem variar com base nos recursos consumidos reais, e o Logto reserva o direito de explicar quaisquer alterações nos preços unitários.',
  unlimited: 'Ilimitado',
  contact: 'Contato',
  // eslint-disable-next-line no-template-curly-in-string
  monthly_price: '${{value, number}}/mês',
  // eslint-disable-next-line no-template-curly-in-string
  mau_price: '${{value, number}}/MAU',
  days_one: '{{count, number}} dia',
  days_other: '{{count, number}} dias',
  add_on: 'Adicionar',
};

export default quota_table;

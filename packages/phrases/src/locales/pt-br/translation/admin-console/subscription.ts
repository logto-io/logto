const subscription = {
  free_plan: 'Plano gratuito',
  free_plan_description:
    'Para projetos secundários e testes iniciais do Logto. Sem cartão de crédito.',
  hobby_plan: 'Plano de Hobby',
  hobby_plan_description: 'Para desenvolvedores individuais ou ambientes de desenvolvimento.',
  pro_plan: 'Plano Pro',
  pro_plan_description: 'Para empresas se beneficiarem sem preocupações com o Logto.',
  enterprise: 'Empresa',
  current_plan: 'Plano atual',
  current_plan_description:
    'Este é o seu plano atual. Você pode ver o uso do plano, sua próxima fatura e atualizar para um plano de nível superior, se desejar.',
  plan_usage: 'Uso do plano',
  plan_cycle: 'Ciclo do plano: {{period}}. O uso é renovado em {{renewDate}}.',
  next_bill: 'Sua próxima fatura',
  next_bill_hint: 'Para saber mais sobre o cálculo, consulte este <a>artigo</a>.',
  next_bill_tip:
    'Sua próxima fatura inclui o preço base do seu plano para o próximo mês, além do custo do seu uso multiplicado pelo preço da unidade MAU em vários níveis.',
  manage_payment: 'Gerenciar pagamento',
  overfill_quota_warning:
    'Você atingiu seu limite de cota. Para evitar problemas, atualize o plano.',
  upgrade_pro: 'Atualizar para Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Problema de pagamento detectado. Não é possível processar ${{price, number}} para o ciclo anterior. Atualize o pagamento para evitar a suspensão do serviço Logto.',
  downgrade: 'Rebaixar',
  current: 'Atual',
  buy_now: 'Comprar agora',
  contact_us: 'Contate-nos',
  quota_table: {
    quota: {
      title: 'Cota',
      tenant_limit: 'Limite do inquilino',
      base_price: 'Preço base',
      mau_unit_price: '* Preço de unidade MAU',
      mau_limit: 'Limite MAU',
    },
    application: {
      title: 'Aplicativos',
      total: 'Total',
      m2m: 'Máquina para máquina',
    },
    resource: {
      title: 'Recursos de API',
      resource_count: 'Contagem de recursos',
      scopes_per_resource: 'Permissão por recurso',
    },
    branding: {
      title: 'Marca',
      custom_domain: 'Domínio personalizado',
    },
    user_authn: {
      title: 'Autenticação do usuário',
      omni_sign_in: 'Omni Sign-In',
      built_in_email_connector: 'Conector de email incorporado',
      social_connectors: 'Conectores sociais',
      standard_connectors: 'Conectores padrão',
    },
    roles: {
      title: 'Funções',
      roles: 'Funções',
      scopes_per_role: 'Permissão por função',
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
      customer_ticket: 'Suporte ao cliente',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Nossos preços unitários podem variar com base nos recursos consumidos de fato, e a Logto reserva-se o direito de explicar quaisquer alterações nos preços unitários.',
    unlimited: 'Ilimitado',
    contact: 'Contato',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/mês',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} dia',
    days_other: '{{count, number}} dias',
    add_on: 'Add-on',
  },
  downgrade_form: {
    allowed_title: 'Tem certeza de que deseja rebaixar?',
    allowed_description:
      'Ao rebaixar para o {{plan}}, você não terá mais acesso aos seguintes benefícios.',
    not_allowed_title: 'Você não tem permissão para rebaixar',
    not_allowed_description:
      'Certifique-se de atender aos seguintes critérios antes de rebaixar para o {{plan}}. Depois de reconciliar e cumprir os requisitos, você será elegível para o rebaixamento.',
    confirm_downgrade: 'Rebaixar mesmo assim',
  },
};

export default subscription;

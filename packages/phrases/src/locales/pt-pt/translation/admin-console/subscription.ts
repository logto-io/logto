const subscription = {
  free_plan: 'Plano Grátis',
  free_plan_description:
    'Para projetos paralelos e testes iniciais da Logto. Sem cartão de crédito.',
  hobby_plan: 'Plano Hobby',
  hobby_plan_description: 'Para desenvolvedores individuais ou ambientes de desenvolvimento.',
  pro_plan: 'Plano Pro',
  pro_plan_description: 'Para empresas aproveitarem a Logto sem preocupações.',
  enterprise: 'Empresas',
  current_plan: 'Plano Atual',
  current_plan_description:
    'Este é o seu plano atual. Você pode ver o uso do plano, a próxima fatura e fazer upgrade para um plano de nível superior, se desejar.',
  plan_usage: 'Utilização do plano',
  plan_cycle: 'Ciclo do plano: {{period}}. A utilização é renovada em {{renewDate}}.',
  next_bill: 'Próxima fatura',
  next_bill_hint: 'Para saber mais sobre o cálculo, consulte este <a>artigo</a>.',
  next_bill_tip:
    'Sua próxima fatura inclui o preço base do seu plano para o próximo mês, bem como o custo da sua utilização multiplicado pelo preço unitário do MAU em vários níveis.',
  manage_payment: 'Gerenciar pagamento',
  overfill_quota_warning:
    'Você atingiu o limite de cota. Para evitar problemas, faça upgrade do plano.',
  upgrade_pro: 'Fazer upgrade para Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Detectado problema de pagamento. Não é possível processar ${{price, number}} para o ciclo anterior. Atualize o pagamento para evitar a suspensão do serviço Logto.',
  downgrade: 'Fazer downgrade',
  current: 'Atual',
  buy_now: 'Comprar agora',
  contact_us: 'Contacte-nos',
  quota_table: {
    quota: {
      title: 'Cota',
      tenant_limit: 'Limite de inquilinos',
      base_price: 'Preço base',
      mau_unit_price: '* Preço unitário do MAU',
      mau_limit: 'Limite do MAU',
    },
    application: {
      title: 'Aplicações',
      total: 'Total',
      m2m: 'Machine to machine',
    },
    resource: {
      title: 'Recursos da API',
      resource_count: 'Contagem de recursos',
      scopes_per_resource: 'Permissão por recurso',
    },
    branding: {
      title: 'Personalização',
      custom_domain: 'Domínio Personalizado',
    },
    user_authn: {
      title: 'Autenticação de Usuário',
      omni_sign_in: 'Omni sign-in',
      built_in_email_connector: 'Conector de email interno',
      social_connectors: 'Conectores sociais',
      standard_connectors: 'Conectores padrão',
    },
    roles: {
      title: 'Funções',
      roles: 'Funções',
      scopes_per_role: 'Permissão por função',
    },
    audit_logs: {
      title: 'Logs de Auditoria',
      retention: 'Retenção',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Quantidade',
    },
    support: {
      title: 'Suporte',
      community: 'Comunidade',
      customer_ticket: 'Ticket de cliente',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Nossos preços unitários podem variar com base nos recursos realmente consumidos, e a Logto se reserva o direito de explicar quaisquer alterações nos preços unitários.',
    unlimited: 'Ilimitado',
    contact: 'Contacte',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/mês',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} dia',
    days_other: '{{count, number}} dias',
    add_on: 'Add-on',
  },
  downgrade_form: {
    allowed_title: 'Tem certeza que deseja fazer downgrade?',
    allowed_description:
      'Ao fazer downgrade para o {{plan}}, você não terá mais acesso aos seguintes benefícios.',
    not_allowed_title: 'Você não tem permissão para fazer downgrade',
    not_allowed_description:
      'Certifique-se de atender aos seguintes critérios antes de fazer downgrade para o {{plan}}. Assim que você tiver reconciliado e atendido aos requisitos, você estará qualificado para fazer o downgrade.',
    confirm_downgrade: 'Fazer downgrade mesmo assim',
  },
};

export default subscription;

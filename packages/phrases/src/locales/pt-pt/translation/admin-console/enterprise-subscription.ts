const enterprise_subscription = {
  page_title: 'Subscrição',
  title: 'Gerir a tua subscrição',
  subtitle: 'Isto é para gerir a tua subscrição multi-inquilino e histórico de faturação',
  tab: {
    subscription: 'Subscrição',
    billing_history: 'Histórico de faturação',
  },
  subscription: {
    title: 'Subscrição',
    description:
      'Acompanhe facilmente o teu uso, veja a tua próxima fatura e reveja o teu contrato original.',
    enterprise_plan_title: 'Plano Empresarial',
    enterprise_plan_description:
      'Esta é a tua subscrição do Plano Empresarial e esta quota é partilhada entre inquilinos. O uso pode estar sujeito a um ligeiro atraso nas atualizações.',
    add_on_title: 'Add-ons pagas conforme o uso',
    add_on_description:
      'Estes são add-ons pagas conforme o uso, com base no teu contrato ou nas taxas padrão paga conforme o uso da Logto. Serás cobrado de acordo com o teu uso real.',
    included: 'Incluído',
    over_quota: 'Acima da quota',
    basic_plan_column_title: {
      product: 'Produto',
      usage: 'Uso',
      quota: 'Quota',
    },
    add_on_column_title: {
      product: 'Produto',
      unit_price: 'Preço Unitário',
      quantity: 'Quantidade',
      total_price: 'Total',
    },
    add_on_sku_price: '${{price}}/mês',
    private_region_title: 'Instância em nuvem privada ({{regionName}})',
    shared_cross_tenants: 'Entre inquilinos',
  },
  user_subscriptions: {
    description:
      'Consulte as suas subscrições pessoais e a cobertura Enterprise contratada, independentemente do tenant selecionado.',
    personal_title: 'Subscrições pessoais',
    personal_description: 'Subscrições faturadas à sua conta, incluindo subscrições anteriores.',
    price: 'Preço',
    billing_period: 'Período de faturação',
    list_price_note:
      'Os preços não incluem impostos nem descontos. As alterações são calculadas proporcionalmente na sua próxima fatura.',
    overdue_note:
      'O pagamento está em atraso. Se continuar por pagar, a subscrição pode ser suspensa e as suas funcionalidades pagas removidas.',
    cancel_on: 'Cancelamento agendado para {{date}}',
    other_product: 'Outra subscrição',
    enterprise_invoices_description:
      'Faturas do seu contrato Enterprise. Selecione uma fatura para a ver e transferir a fatura ou o recibo.',
    personal_invoices_description:
      'Faturas das subscrições cobradas na sua conta, incluindo subscrições anteriores. Selecione uma fatura para a ver e transferir a fatura ou o recibo.',
    credit_note:
      'Os créditos de remoções ou rateios reduzem faturas posteriores e não são necessariamente reembolsados de imediato no seu método de pagamento.',
    invoice_link_unavailable:
      'A página desta fatura não está disponível. Contacte-nos se precisar de uma cópia.',
    status: {
      active: 'Ativa',
      trialing: 'Em avaliação',
      past_due: 'Em atraso',
      unpaid: 'Não paga',
      canceled: 'Cancelada',
      incomplete: 'Incompleta',
      incomplete_expired: 'Expirada',
      paused: 'Suspensa',
    },
  },
};

export default Object.freeze(enterprise_subscription);

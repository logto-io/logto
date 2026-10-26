const enterprise_subscription = {
  page_title: 'Assinatura',
  title: 'Gerencie sua assinatura',
  subtitle: 'Isto é para gerenciar sua assinatura multi-inquilino e histórico de faturamento',
  tab: {
    subscription: 'Assinatura',
    billing_history: 'Histórico de cobranças',
  },
  subscription: {
    title: 'Assinatura',
    description:
      'Acompanhe facilmente seu uso, veja sua próxima fatura e reveja seu contrato original.',
    enterprise_plan_title: 'Plano Empresarial',
    enterprise_plan_description:
      'Esta é sua assinatura do Plano Empresarial e esta cota é compartilhada entre inquilinos. O uso pode estar sujeito a um pequeno atraso nas atualizações. ',
    add_on_title: 'Complementos pay as you go',
    add_on_description:
      'Estes são complementos pay-as-you-go adicionais baseados no seu contrato ou nas tarifas padrão pay-as-you-go do Logto. Você será cobrado de acordo com o seu uso real.',
    included: 'Incluído',
    over_quota: 'Acima da cota',
    basic_plan_column_title: {
      product: 'Produto',
      usage: 'Uso',
      quota: 'Cota',
    },
    add_on_column_title: {
      product: 'Produto',
      unit_price: 'Preço Unitário',
      quantity: 'Quantidade',
      total_price: 'Total',
    },
    add_on_sku_price: '${{price}}/mês',
    private_region_title: 'Instância de nuvem privada ({{regionName}})',
    shared_cross_tenants: 'Entre inquilinos',
  },
  user_subscriptions: {
    description:
      'Veja suas assinaturas pessoais e a cobertura Enterprise contratada, independentemente do tenant selecionado.',
    personal_title: 'Assinaturas pessoais',
    personal_description:
      'Assinaturas ativas cobradas da sua conta. As assinaturas anteriores continuam no histórico de cobranças.',
    price: 'Preço',
    next_charge: 'Próxima cobrança',
    cancels_on: 'Cancela em {{date}}',
    ends_on: 'Termina em {{date}}',
    overdue_note:
      'O pagamento está atrasado. Se continuar sem pagamento, a assinatura pode ser pausada e seus recursos pagos removidos.',
    other_product: 'Outra assinatura',
    enterprise_invoices_description:
      'Faturas do seu contrato Enterprise. Selecione uma fatura para visualizá-la e baixar a fatura ou o recibo.',
    personal_invoices_description:
      'Faturas das assinaturas cobradas na sua conta, incluindo assinaturas anteriores. Selecione uma fatura para visualizá-la e baixar a fatura ou o recibo.',
    credit_note:
      'Créditos de remoções ou rateios reduzem faturas posteriores e não são necessariamente reembolsados de imediato ao seu método de pagamento.',
    invoice_link_unavailable:
      'A página desta fatura não está disponível. Entre em contato conosco se precisar de uma cópia.',
    status: {
      active: 'Ativa',
      trialing: 'Em teste',
      past_due: 'Em atraso',
      unpaid: 'Não paga',
      canceled: 'Cancelada',
      incomplete: 'Incompleta',
      incomplete_expired: 'Expirada',
      paused: 'Pausada',
    },
  },
};

export default Object.freeze(enterprise_subscription);

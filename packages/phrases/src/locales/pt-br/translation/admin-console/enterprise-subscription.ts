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
    personal_description: 'Assinaturas cobradas da sua conta, incluindo assinaturas anteriores.',
    enterprise_description:
      'A cota de Console SSO é definida em contrato e compartilhada entre administradores autorizados. As assinaturas pessoais são cobradas separadamente.',
    allowance: 'Cota contratada',
    not_covered:
      'Este plano Enterprise não inclui cota de Console SSO. Novos conectores são cobrados em uma assinatura pessoal.',
    quantity_price: 'Quantidade × preço unitário',
    billing_period: 'Período de cobrança',
    connectors: 'Conectores de Console SSO',
    no_connectors: 'Nenhum conector',
    list_price_note:
      'A quantidade, o preço unitário e o status exibidos vêm do registro da assinatura. Pausar a cobrança pode manter a quantidade e o status inalterados. Os preços unitários excluem impostos, descontos e ajustes proporcionais e não representam cobranças atuais nem um valor devido.',
    proration_note:
      'Adições e remoções de Console SSO são calculadas proporcionalmente na fatura regular. Excluir o último conector pago cancela e liquida a assinatura.',
    overdue_note:
      'Após três períodos de cobrança consecutivos não pagos e o esgotamento das tentativas, a cobrança é pausada e os conectores pagos de Console SSO são removidos. Atualizar o pagamento não restaura a configuração. Entre em contato para obter ajuda.',
    cancel_on: 'Cancelamento agendado para {{date}}',
    other_product: 'Outra assinatura',
    billing_history_title: 'Histórico de cobrança',
    billing_history_description:
      'Faturas das suas assinaturas pessoais e do seu contrato Enterprise. Selecione uma fatura para visualizá-la e baixar a fatura ou o recibo.',
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

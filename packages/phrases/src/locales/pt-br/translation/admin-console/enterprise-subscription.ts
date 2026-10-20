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
    quantity_price: 'Quantidade × preço unitário',
    billing_period: 'Período de cobrança',
    connectors: 'Conectores de Console SSO',
    no_connectors: 'Nenhum conector',
    list_price_note:
      'Os preços unitários de tabela excluem impostos, descontos e ajustes proporcionais. Não representam uma próxima fatura nem um valor devido.',
    proration_note:
      'Adições e remoções de Console SSO são calculadas proporcionalmente na fatura regular. Excluir o último conector pago cancela e liquida a assinatura.',
    overdue_note:
      'Após três períodos de cobrança consecutivos não pagos e o esgotamento das tentativas, a cobrança é pausada e os conectores pagos de Console SSO são removidos. Atualizar o pagamento não restaura a configuração. Entre em contato para obter ajuda.',
    cancel_on: 'Cancelamento agendado para {{date}}',
    other_product: 'Outra assinatura',
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

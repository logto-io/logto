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
    enterprise_description:
      'A quota de Console SSO é definida por contrato e partilhada entre administradores autorizados. As subscrições pessoais são faturadas separadamente.',
    allowance: 'Quota contratada',
    not_covered:
      'Este plano Enterprise não inclui quota de Console SSO. Os novos conectores são faturados numa subscrição pessoal.',
    quantity_price: 'Quantidade × preço unitário',
    billing_period: 'Período de faturação',
    connectors: 'Conectores de Console SSO',
    no_connectors: 'Sem conectores',
    list_price_note:
      'A quantidade, o preço unitário e o estado apresentados provêm do registo da subscrição. A suspensão da cobrança pode deixar a quantidade e o estado inalterados. Os preços unitários excluem impostos, descontos e ajustes proporcionais e não representam cobranças atuais nem um montante em dívida.',
    proration_note:
      'As adições e remoções de Console SSO são calculadas proporcionalmente na fatura habitual. Eliminar o último conector pago cancela e liquida a subscrição.',
    overdue_note:
      'Após três períodos de faturação consecutivos não pagos e o esgotamento das tentativas, a cobrança é suspensa e os conectores pagos de Console SSO são removidos. Atualizar o pagamento não restaura a configuração. Contacte-nos para obter ajuda.',
    cancel_on: 'Cancelamento agendado para {{date}}',
    other_product: 'Outra subscrição',
    billing_history_title: 'Histórico de faturação',
    billing_history_description:
      'Faturas das suas subscrições pessoais e do seu contrato Enterprise. Selecione uma fatura para a ver e transferir a fatura ou o recibo.',
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

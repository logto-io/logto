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
};

export default Object.freeze(enterprise_subscription);

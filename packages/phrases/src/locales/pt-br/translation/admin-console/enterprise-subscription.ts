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
};

export default Object.freeze(enterprise_subscription);

import paywall from './paywall.js';

const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Atualizar plano',
  compare_plans: 'Comparar planos',
  create_tenant: {
    title: 'Selecione o seu plano de inquilino',
    description:
      'O Logto oferece opções competitivas de planos com preços inovadores e acessíveis, especialmente concebidos para empresas em crescimento. <a>Saiba mais</a>',
    base_price: 'Preço base',
    monthly_price: '{{value, number}}/mês',
    mau_unit_price: 'Preço unitário do MAU',
    view_all_features: 'Ver todas as funcionalidades',
    select_plan: 'Selecionar <name/>',
    free_tenants_limit: 'Até {{count, number}} inquilino gratuito',
    free_tenants_limit_other: 'Até {{count, number}} inquilinos gratuitos',
    most_popular: 'Mais popular',
    upgrade_success: 'Atualização para <name/> bem-sucedida',
  },
  mau_exceeded_modal: {
    title: 'MAU excedeu o limite. Atualize o seu plano.',
    notification:
      'O seu MAU atual excedeu o limite de <planName/>. Por favor, atualize para o plano premium a tempo para evitar a suspensão do serviço do Logto.',
    update_plan: 'Atualizar plano',
  },
  payment_overdue_modal: {
    title: 'Pagamento da fatura em atraso',
    notification:
      'Oops! O pagamento da fatura do inquilino <span>{{name}}</span> falhou. Por favor, pague a fatura prontamente para evitar a suspensão do serviço Logto.',
    unpaid_bills: 'Faturas não pagas',
    update_payment: 'Atualizar pagamento',
  },
  paywall,
};

export default Object.freeze(upsell);

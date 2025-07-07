import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Atualizar plano',
  compare_plans: 'Comparar planos',
  view_plans: 'Ver planos',
  create_tenant: {
    title: 'Selecione o seu plano de inquilino',
    description:
      'O Logto oferece opções competitivas de planos com preços inovadores e acessíveis, especialmente concebidos para empresas em crescimento. <a>Saiba mais</a>',
    base_price: 'Preço base',
    monthly_price: '{{value, number}}/mês',
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
  token_exceeded_modal: {
    title: 'Uso de tokens excedeu o limite. Atualize o seu plano.',
    notification:
      'Você excedeu o limite de uso de tokens do seu <planName/>. Os utilizadores não poderão aceder ao serviço Logto corretamente. Por favor, atualize seu plano para premium prontamente para evitar qualquer inconveniência.',
  },
  payment_overdue_modal: {
    title: 'Pagamento da fatura em atraso',
    notification:
      'Oops! O pagamento da fatura do inquilino <span>{{name}}</span> falhou. Por favor, pague a fatura prontamente para evitar a suspensão do serviço Logto.',
    unpaid_bills: 'Faturas não pagas',
    update_payment: 'Atualizar pagamento',
  },
  add_on_quota_item: {
    api_resource: 'Recurso de API',
    machine_to_machine: 'aplicação máquina a máquina',
    tokens: '{{limit}}M tokens',
    tenant_member: 'membro do inquilino',
  },
  charge_notification_for_quota_limit:
    'Você ultrapassou o limite de sua cota de {{item}}. O Logto adicionará cobranças pelo uso além do limite da cota. A cobrança começará no dia em que o novo design de preços do complemento for lançado. <a>Saiba mais</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title:
      'Você está prestes a mudar o seu inquilino de desenvolvimento para inquilino de produção',
    description:
      'Pronto para entrar em funcionamento? Converter este inquilino de desenvolvimento para um inquilino de produção desbloqueia a funcionalidade completa',
    benefits: {
      stable_environment: 'Para utilizadores finais: Um ambiente estável para uso real.',
      keep_pro_features:
        'Mantenha os recursos Pro: Você vai assinar o plano Pro. <a>Ver recursos Pro.</a>',
      no_dev_restrictions:
        'Sem restrições de desenvolvimento: Remove os limites de entidade e sistema de recursos e o banner de login.',
    },
    cards: {
      dev_description: 'Para fins de teste',
      prod_description: 'Produção real',
      convert_label: 'converter',
    },
    button: 'Converter para inquilino de produção',
  },
};

export default Object.freeze(upsell);

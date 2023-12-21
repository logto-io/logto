import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Ulepsz plan',
  compare_plans: 'Porównaj plany',
  view_plans: 'Zobacz plany',
  create_tenant: {
    title: 'Wybierz swój plan najemcy',
    description:
      'Logto oferuje konkurencyjne opcje planów z innowacyjnym i przystępnym cenowo modelu dla rozwijających się firm. <a>Dowiedz się więcej</a>',
    base_price: 'Cena podstawowa',
    monthly_price: '{{value, number}}/mies.',
    mau_unit_price: 'Cena jednostkowa MAU',
    view_all_features: 'Zobacz wszystkie funkcje',
    select_plan: 'Wybierz <name/>',
    free_tenants_limit: 'Do {{count, number}} bezpłatnego najemcy',
    free_tenants_limit_other: 'Do {{count, number}} bezpłatnych najemców',
    most_popular: 'Najpopularniejszy',
    upgrade_success: 'Pomyślnie ulepszono do <name/>',
  },
  mau_exceeded_modal: {
    title: 'MAU przekroczyło limit. Ulepsz swój plan.',
    notification:
      'Obecna liczba MAU przekroczyła limit planu <planName/>. Proszę natychmiast zaktualizować swój plan na wersję premium, aby uniknąć zawieszenia usługi Logto.',
    update_plan: 'Zaktualizuj plan',
  },
  payment_overdue_modal: {
    title: 'Opłata za fakturę zaległa',
    notification:
      'Ups! Płatność za fakturę najemcy <span>{{name}}</span> nie powiodła się. Proszę zapłacić fakturę w odpowiednim terminie, aby uniknąć zawieszenia usługi Logto.',
    unpaid_bills: 'Nieuregulowane faktury',
    update_payment: 'Zaktualizuj płatność',
  },
  charge_notification_for_quota_limit:
    'Osiągnąłeś swój limit przypisany. Możemy dodać opłaty za funkcje, które przekraczają Twój limit przypisany jako dodatki, gdy ustalimy ceny.',
  charge_notification_for_token_limit:
    'Osiągnąłeś swój limit łącznego przypisanego tokenów {{value}}M. Możemy dodać opłaty za funkcje, które przekraczają Twój limit przypisany jako dodatki, gdy ustalimy ceny.',
  charge_notification_for_m2m_app_limit:
    'Osiągnąłeś swój limit przypisany dla aplikacji typu machine-to-machine. Możemy dodać opłaty za funkcje, które przekraczają Twój limit przypisany jako dodatki, gdy ustalimy ceny.',
  paywall,
};

export default Object.freeze(upsell);

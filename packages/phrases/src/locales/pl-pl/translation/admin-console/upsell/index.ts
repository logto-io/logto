import paywall from './paywall.js';

const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Ulepsz plan',
  compare_plans: 'Porównaj plany',
  get_started: {
    title: 'Rozpocznij swój płynny proces identyfikacji dzięki darmowemu planowi!',
    description:
      'Darmowy plan doskonale sprawdzi się do przetestowania Logto na twoich projektach czy testach. Aby w pełni wykorzystać możliwości Logto dla twojego zespołu, zaktualizuj plan i uzyskaj nieograniczony dostęp do funkcji premium: nielimitowanej liczby MAU, integracji maszynowej, zarządzania RBAC, długoterminowych dzienników audytu itd. <a>Zobacz wszystkie plany</a>',
  },
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
  paywall,
};

export default Object.freeze(upsell);

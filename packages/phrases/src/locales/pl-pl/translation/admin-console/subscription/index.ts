import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'Plan Darmowy',
  free_plan_description:
    'Dla projektów pobocznych i początkowych prób Logto. Brak wymaganej karty kredytowej.',
  pro_plan: 'Plan Pro',
  pro_plan_description: 'Dla firm, ciesz się bezstresową obsługą Logto.',
  enterprise: 'Plan Przedsiębiorstwo',
  /** UNTRANSLATED */
  enterprise_description: 'For large teams and businesses with enterprise-grade requirements.',
  admin_plan: 'Plan administracyjny',
  dev_plan: 'Plan deweloperski',
  current_plan: 'Obecny plan',
  current_plan_description:
    'Oto Twój obecny plan. Łatwo możesz sprawdzić wykorzystanie swojego planu, sprawdzić nadchodzący rachunek i dokonać zmian w planie, jeśli jest to konieczne.',
  plan_usage: 'Wykorzystanie planu',
  plan_cycle: 'Cykl planu: {{period}}. Użycie odnawiane w dniu {{renewDate}}.',
  next_bill: 'Twój nadchodzący rachunek',
  next_bill_hint: 'Aby dowiedzieć się więcej o obliczeniach, zapoznaj się z tym <a>artykułem</a>.',
  next_bill_tip:
    'Ceny przedstawione tutaj są bez podatku i mogą podlegać niewielkiemu opóźnieniu w aktualizacjach. Kwota podatku zostanie obliczona na podstawie informacji, które podasz oraz lokalnych wymogów prawnych, i będzie wyświetlona na twoich fakturach.',
  manage_payment: 'Zarządzanie płatnościami',
  overfill_quota_warning:
    'Osiągnąłeś limit swojej puli. Aby uniknąć problemów, zaktualizuj swój plan.',
  upgrade_pro: 'Uaktualnij do Pro',
  update_payment: 'Zaktualizuj płatność',
  payment_error:
    'Wykryto problem z płatnością. Nie można przetworzyć ${{price, number}} za poprzedni cykl. Zaktualizuj płatność, aby uniknąć zawieszenia usługi Logto.',
  downgrade: 'Zdegradować',
  current: 'Obecnie',
  upgrade: 'Aktualizacja',
  quota_table,
  billing_history: {
    invoice_column: 'Faktury',
    status_column: 'Status',
    amount_column: 'Kwota',
    invoice_created_date_column: 'Data utworzenia faktury',
    invoice_status: {
      void: 'Anulowana',
      paid: 'Opłacona',
      open: 'Otwarta',
      uncollectible: 'Zaległa',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Czy na pewno chcesz zdegradować?',
    description:
      'Jeśli zdecydujesz się przełączyć na <targetName/>, pamiętaj, że nie będziesz już mieć dostępu do przyznanych wcześniej limitów i funkcji w <currentName/>. ',
    before: 'Przed: <name/>',
    after: 'Po: <name />',
    downgrade: 'Zdegradować',
  },
  not_eligible_modal: {
    downgrade_title: 'Nie spełniasz warunków do zmniejszenia',
    downgrade_description:
      'Upewnij się, że spełniasz następujące kryteria przed zmniejszeniem do <name/>.',
    downgrade_help_tip: 'Potrzebna pomoc przy zmniejszaniu? <a>Skontaktuj się z nami</a>.',
    upgrade_title: 'Przyjazne przypomnienie dla naszych szanowanych wczesnych użytkowników',
    upgrade_description:
      'Obecnie używasz więcej niż to, co pozwala <name />. Logto jest teraz oficjalne, z funkcjami dostosowanymi do każdego planu. Zanim rozważysz aktualizację do <name />, upewnij się, że spełniasz poniższe kryteria przed dokonaniem aktualizacji.',
    upgrade_pro_tip: ' Lub rozważ aktualizację do Planu Pro.',
    upgrade_help_tip: 'Potrzebna pomoc przy zwiększaniu? <a>Skontaktuj się z nami</a>.',
    a_maximum_of: 'Maksymalnie <item/>',
  },
  upgrade_success: 'Pomyślnie uaktualniono do <name/>',
  downgrade_success: 'Pomyślnie zdegradowano do <name/>',
  subscription_check_timeout: 'Czas sprawdzenia subskrypcji wygasł. Proszę odświeżyć później.',
  no_subscription: 'Brak subskrypcji',
  usage,
};

export default Object.freeze(subscription);

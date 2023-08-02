import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Darmowy plan',
  free_plan_description:
    'Dla projektów pobocznych i początkowych prób Logto. Brak wymaganej karty kredytowej.',
  hobby_plan: 'Plan hobbystyczny',
  hobby_plan_description: 'Dla indywidualnych programistów lub środowisk deweloperskich.',
  pro_plan: 'Plan Pro',
  pro_plan_description: 'Dla firm, ciesz się bezstresową obsługą Logto.',
  enterprise: 'Enterprise',
  current_plan: 'Obecny plan',
  current_plan_description:
    'Oto Twój obecny plan. Łatwo możesz sprawdzić wykorzystanie swojego planu, sprawdzić nadchodzący rachunek i dokonać zmian w planie, jeśli jest to konieczne.',
  plan_usage: 'Wykorzystanie planu',
  plan_cycle: 'Cykl planu: {{period}}. Użycie odnawiane w dniu {{renewDate}}.',
  next_bill: 'Twoje następne rozliczenie',
  next_bill_hint: 'Aby dowiedzieć się więcej o obliczeniach, zapoznaj się z tym <a>artykułem</a>.',
  next_bill_tip:
    'Twoje nadchodzące rozliczenie zawiera cenę podstawowego planu na kolejny miesiąc oraz koszt korzystania pomnożony przez cenę jednostkową MAU w różnych poziomach.',
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
};

export default Object.freeze(subscription);

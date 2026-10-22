const enterprise_subscription = {
  page_title: 'Subskrypcja',
  title: 'Zarządzaj swoją subskrypcją',
  subtitle: 'To jest do zarządzania swoją subskrypcją wielu najemców i historią rozliczeń',
  tab: {
    subscription: 'Subskrypcja',
    billing_history: 'Historia rozliczeń',
  },
  subscription: {
    title: 'Subskrypcja',
    description:
      'Łatwo śledź swoje zużycie, zobacz swój następny rachunek i przejrzyj swoją oryginalną umowę.',
    enterprise_plan_title: 'Plan przedsiębiorstwa',
    enterprise_plan_description:
      'To jest Twoja subskrypcja planu przedsiębiorstwa, a ten limit jest dzielony między najemców. Zużycie może być opóźnione w aktualizacjach.',
    add_on_title: 'Dodatki „płać za użycie”',
    add_on_description:
      'Są to dodatkowe dodatki „płać za użycie” na podstawie twojej umowy lub standardowych stawek „płać za użycie” Logto. Pobierana będzie opłata zgodnie z faktycznym użyciem.',
    included: 'W zestawie',
    over_quota: 'Poza limitem',
    basic_plan_column_title: {
      product: 'Produkt',
      usage: 'Zużycie',
      quota: 'Limit',
    },
    add_on_column_title: {
      product: 'Produkt',
      unit_price: 'Cena jednostkowa',
      quantity: 'Ilość',
      total_price: 'Suma',
    },
    add_on_sku_price: '{{price}} USD/mies.',
    private_region_title: 'Prywatna instancja chmury ({{regionName}})',
    shared_cross_tenants: 'W tym dla najemców',
  },
  user_subscriptions: {
    description:
      'Przeglądaj subskrypcje osobiste i umowny zakres Enterprise niezależnie od wybranego tenanta.',
    personal_title: 'Subskrypcje osobiste',
    personal_description: 'Subskrypcje rozliczane na Twoim koncie, w tym wcześniejsze subskrypcje.',
    enterprise_description:
      'Limit Console SSO określa umowa i jest on współdzielony przez upoważnionych administratorów. Subskrypcje osobiste są rozliczane oddzielnie.',
    allowance: 'Limit umowny',
    not_covered:
      'Ten plan Enterprise nie obejmuje limitu Console SSO. Nowe konektory są rozliczane w ramach subskrypcji osobistej.',
    quantity_price: 'Ilość × cena jednostkowa',
    billing_period: 'Okres rozliczeniowy',
    connectors: 'Konektory Console SSO',
    no_connectors: 'Brak konektorów',
    list_price_note:
      'Wyświetlana ilość, cena jednostkowa i status pochodzą z rekordu subskrypcji. Wstrzymanie pobierania opłat może pozostawić ilość i status bez zmian. Ceny jednostkowe nie obejmują podatków, rabatów ani korekt proporcjonalnych i nie oznaczają bieżących opłat ani należności do zapłaty.',
    proration_note:
      'Dodawanie i usuwanie Console SSO jest rozliczane proporcjonalnie na zwykłej fakturze. Usunięcie ostatniego płatnego konektora anuluje i rozlicza subskrypcję.',
    overdue_note:
      'Po trzech kolejnych nieopłaconych okresach rozliczeniowych i wyczerpaniu prób płatności pobieranie opłat zostaje wstrzymane, a płatne konektory Console SSO usunięte. Aktualizacja płatności nie przywraca ich konfiguracji. Skontaktuj się z nami, aby uzyskać pomoc.',
    cancel_on: 'Anulowanie zaplanowane na {{date}}',
    other_product: 'Inna subskrypcja',
    billing_history_title: 'Historia rozliczeń',
    billing_history_description:
      'Faktury za Twoje subskrypcje osobiste i umowę Enterprise. Wybierz fakturę, aby ją wyświetlić i pobrać fakturę lub potwierdzenie płatności.',
    credit_note:
      'Środki z usunięć lub rozliczeń proporcjonalnych pomniejszają kolejne faktury i niekoniecznie są od razu zwracane na Twoją metodę płatności.',
    invoice_link_unavailable:
      'Strona tej faktury jest niedostępna. Skontaktuj się z nami, jeśli potrzebujesz kopii.',
    status: {
      active: 'Aktywna',
      trialing: 'Okres próbny',
      past_due: 'Zaległa',
      unpaid: 'Nieopłacona',
      canceled: 'Anulowana',
      incomplete: 'Niekompletna',
      incomplete_expired: 'Wygasła',
      paused: 'Wstrzymana',
    },
  },
};

export default Object.freeze(enterprise_subscription);

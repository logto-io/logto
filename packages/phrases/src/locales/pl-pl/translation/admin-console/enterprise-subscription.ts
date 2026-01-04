const enterprise_subscription = {
  page_title: 'Subskrypcja',
  title: 'Zarządzaj swoją subskrypcją',
  subtitle:
    'Przeglądaj i zarządzaj szczegółami subskrypcji dla wielu najemców oraz informacjami o rozliczeniach.',
  tab: {
    subscription: 'Subskrypcja',
    billing_history: 'Historia rozliczeń',
  },
  subscription: {
    title: 'Subskrypcja',
    description:
      'Sprawdź szczegóły dotyczące wykorzystania bieżącego planu subskrypcji oraz informacje o rozliczeniach.',
    enterprise_plan_title: 'Plan przedsiębiorstwa',
    enterprise_plan_description:
      'To jest Twoja subskrypcja planu przedsiębiorstwa, a ten limit jest współdzielony przez wszystkich najemców w ramach subskrypcji przedsiębiorstwa.',
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
};

export default Object.freeze(enterprise_subscription);

const subscription = {
  free_plan: 'Plan Bezpłatny',
  free_plan_description:
    'Dla projektów pobocznych i początkowych prób Logto. Brak informacji o karcie kredytowej.',
  hobby_plan: 'Plan Hobby',
  hobby_plan_description: 'Dla indywidualnych programistów lub środowisk deweloperskich.',
  pro_plan: 'Plan Pro',
  pro_plan_description: 'Dla firm korzyść z bezproblemowego korzystania z Logto.',
  enterprise: 'Przedsiębiorstwo',
  current_plan: 'Obecny Plan',
  current_plan_description:
    'To jest twój obecny plan. Możesz wyświetlić korzystanie z planu, następną fakturę i zaktualizować go do wyższego planu, jeśli chcesz.',
  plan_usage: 'Użycie planu',
  plan_cycle: 'Cykl planu: {{period}}. Użycie odnawia się {{renewDate}}.',
  next_bill: 'Twoja następna faktura',
  next_bill_hint: 'Aby dowiedzieć się więcej o obliczeniach, przeczytaj ten <a>artykuł</a>.',
  next_bill_tip:
    'Twoja nadchodząca faktura zawiera cenę podstawową Twojego planu na następny miesiąc, a także koszt Twojego korzystania pomnożony przez cenę jednostkową użytkownika miesięcznie.',
  manage_payment: 'Zarządzaj płatnościami',
  overfill_quota_warning: 'Osiągnąłeś limit kontyngentu. Aby uniknąć problemów, zaktualizuj plan.',
  upgrade_pro: 'Zmień na Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Wykryto problem z płatnością. Nie można przetworzyć kwoty ${{price, number}} za poprzedni cykl. Zaktualizuj swoją płatność, aby uniknąć przerwania usługi Logto.',
  downgrade: 'Zmień na niższy plan',
  current: 'Obecny',
  buy_now: 'Kup teraz',
  contact_us: 'Skontaktuj się z nami',
  quota_table: {
    quota: {
      title: 'Limit',
      tenant_limit: 'Limit najemcy',
      base_price: 'Podstawowa cena',
      mau_unit_price: '* Cena jednostkowa MAU',
      mau_limit: 'Limit MAU',
    },
    application: {
      title: 'Aplikacje',
      total: 'Razem',
      m2m: 'Od maszyny do maszyny',
    },
    resource: {
      title: 'Zasoby API',
      resource_count: 'Liczba zasobów',
      scopes_per_resource: 'Uprawnienia na zasób',
    },
    branding: {
      title: 'Marka',
      custom_domain: 'Niestandardowa domena',
    },
    user_authn: {
      title: 'Uwierzytelnianie użytkownika',
      omni_sign_in: 'Omni logowanie',
      built_in_email_connector: 'Wbudowany konektor do poczty e-mail',
      social_connectors: 'Konektory społecznościowe',
      standard_connectors: 'Konektory standardowe',
    },
    roles: {
      title: 'Role',
      roles: 'Role',
      scopes_per_role: 'Uprawnienia na rolę',
    },
    audit_logs: {
      title: 'Logowanie audytu',
      retention: 'Okres przechowywania',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Ilość',
    },
    support: {
      title: 'Wsparcie',
      community: 'Wspołeczność',
      customer_ticket: 'Bilet klienta',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Nasze ceny jednostkowe mogą się różnić w zależności od faktycznie używanych zasobów i Logto zastrzega sobie prawo do wyjaśnienia wszelkich zmian w cenach jednostkowych.',
    unlimited: 'Nieograniczone',
    contact: 'Kontakt',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/mies.',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} dzień',
    days_other: '{{count, number}} dni',
    add_on: 'Dodatkowe',
  },
  downgrade_form: {
    allowed_title: 'Czy na pewno chcesz zmniejszyć plan?',
    allowed_description:
      'Zmniejszając do {{plan}}, przestaniesz mieć dostęp do następujących korzyści.',
    not_allowed_title: 'Nie jesteś uprawniony do zmniejszenia',
    not_allowed_description:
      'Upewnij się, że spełniasz następujące wymagania przed zmniejszeniem do {{plan}}. Po spełnieniu tych wymagań, będziesz uprawniony do zmniejszenia.',
    confirm_downgrade: 'Zmień mimo wszystko',
  },
};

export default subscription;

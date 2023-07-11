const quota_item = {
  tenant_limit: {
    name: 'Liczba najemców',
    limited: '{{count, number}} najemca',
    limited_other: '{{count, number}} najemców',
    unlimited: 'Nieograniczone liczba najemców',
  },
  mau_limit: {
    name: 'Miesięczni aktywni użytkownicy',
    limited: '{{count, number}} MAU',
    unlimited: 'Nieograniczony liczba MAU',
  },
  applications_limit: {
    name: 'Aplikacje',
    limited: '{{count, number}} aplikacja',
    limited_other: '{{count, number}} aplikacji',
    unlimited: 'Nieograniczona liczba aplikacji',
  },
  machine_to_machine_limit: {
    name: 'Aplikacje maszynowe do człowieka',
    limited: '{{count, number}} aplikacja maszynowa do człowieka',
    limited_other: '{{count, number}} aplikacje maszynowe do człowieka',
    unlimited: 'Nieograniczona liczba aplikacji maszynowych do człowieka',
  },
  resources_limit: {
    name: 'Zasoby API',
    limited: '{{count, number}} zasób API',
    limited_other: '{{count, number}} zasobów API',
    unlimited: 'Nieograniczona liczba zasobów API',
  },
  scopes_per_resource_limit: {
    name: 'Uprawnienia zasobów',
    limited: '{{count, number}} uprawnienie na zasób',
    limited_other: '{{count, number}} uprawnienia na zasób',
    unlimited: 'Nieograniczone uprawnienie na zasób',
  },
  custom_domain_enabled: {
    name: 'Dostosowana domena',
    limited: 'Dostosowana domena',
    unlimited: 'Dostosowana domena',
  },
  omni_sign_in_enabled: {
    name: 'Ogólne logowanie',
    limited: 'Ogólne logowanie',
    unlimited: 'Ogólne logowanie',
  },
  built_in_email_connector_enabled: {
    name: 'Wbudowany konektor email',
    limited: 'Wbudowany konektor email',
    unlimited: 'Wbudowany konektor email',
  },
  social_connectors_limit: {
    name: 'Konektory społecznościowe',
    limited: '{{count, number}} konektor społecznościowy',
    limited_other: '{{count, number}} konektory społecznościowe',
    unlimited: 'Nieograniczona liczba konenktorów społecznościowych',
  },
  standard_connectors_limit: {
    name: 'Standardowe konektory darmowe',
    limited: '{{count, number}} standardowy darmowy konektor',
    limited_other: '{{count, number}} standardowe darmowe konektory',
    unlimited: 'Nieograniczona liczba standardowych darmowych konektorów',
  },
  roles_limit: {
    name: 'Role',
    limited: '{{count, number}} rola',
    limited_other: '{{count, number}} role',
    unlimited: 'Nieograniczona liczba ról',
  },
  scopes_per_role_limit: {
    name: 'Uprawnienia roli',
    limited: '{{count, number}} uprawnienie na rolę',
    limited_other: '{{count, number}} uprawnienia na rolę',
    unlimited: 'Nieograniczone uprawnienie na rolę',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} hook',
    limited_other: '{{count, number}} hooki',
    unlimited: 'Nieograniczone hooki',
  },
  audit_logs_retention_days: {
    name: 'Przechowywanie dzienników audytu',
    limited: 'Przechowywanie dzienników audytu: {{count, number}} dzień',
    limited_other: 'Przechowywanie dzienników audytu: {{count, number}} dni',
    unlimited: 'Nieograniczona liczba dni',
  },
  community_support_enabled: {
    name: 'Wsparcie społecznościowe',
    limited: 'Wsparcie społecznościowe',
    unlimited: 'Wsparcie społecznościowe',
  },
  customer_ticket_support: {
    name: 'Wsparcie systemu zgłoszeń klienta',
    limited: '{{count, number}} godzina wsparcia',
    limited_other: '{{count, number}} godziny wsparcia klienta',
    unlimited: 'Wsparcie systemu zgłoszeń klienta',
  },
};

export default quota_item;

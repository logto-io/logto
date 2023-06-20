const tenant_settings = {
  title: 'Ustawienia',
  description: 'Skuteczne zarządzanie ustawieniami najemcy i dostosowywanie domeny.',
  tabs: {
    settings: 'Ustawienia',
    domains: 'Domeny',
  },
  settings: {
    title: 'USTAWIENIA',
    tenant_id: 'ID Najemcy',
    tenant_name: 'Nazwa Najemcy',
    environment_tag: 'Tag Środowiska',
    environment_tag_description:
      'Tagi nie zmieniają usługi. Po prostu pomagają odróżnić różne środowiska.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Informacje o najemcy zostały pomyślnie zapisane.',
  },
  deletion_card: {
    title: 'USUWANIE',
    tenant_deletion: 'Usuń najemcę',
    tenant_deletion_description:
      'Usunięcie najemcy spowoduje trwałe usunięcie wszystkich powiązanych danych użytkowników i konfiguracji. Proszę postępować ostrożnie.',
    tenant_deletion_button: 'Usuń najemcę',
  },
};

export default tenant_settings;

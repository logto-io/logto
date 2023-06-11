const tenant_settings = {
  title: 'Ustawienia Najemcy',
  description:
    'Zmieniaj swoje ustawienia konta i zarządzaj swoimi informacjami osobistymi tutaj, aby zapewnić bezpieczeństwo Twojego konta.',
  tabs: {
    settings: 'Ustawienia',
    domains: 'Domeny',
  },
  profile: {
    title: 'USTAWIENIA PROFILU',
    tenant_id: 'ID Najemcy',
    tenant_name: 'Nazwa Najemcy',
    environment_tag: 'Tag Środowiska',
    environment_tag_description:
      'Użyj tagów, aby rozróżnić środowiska użytkowe najemcy. Usługi w każdym tagu są identyczne, co zapewnia spójność.',
    environment_tag_development: 'Rozwój',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Produkcja',
  },
  deletion_card: {
    title: 'USUWANIE',
    tenant_deletion: 'Usuń najemcę',
    tenant_deletion_description:
      'Usunięcie twojego konta spowoduje usunięcie wszystkich twoich danych osobowych, danych użytkownika i konfiguracji. Ta operacja jest nieodwracalna.',
    tenant_deletion_button: 'Usuń najemcę',
  },
};

export default tenant_settings;

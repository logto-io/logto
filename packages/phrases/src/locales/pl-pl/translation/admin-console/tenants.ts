const tenants = {
  create_modal: {
    title: 'Utwórz nowego najemcę',
    subtitle: 'Utwórz nowego najemcę aby oddzielić zasoby i użytkowników.',
    create_button: 'Utwórz najemcę',
    tenant_name: 'Nazwa najemcy',
    tenant_name_placeholder: 'Mój najemca',
    environment_tag: 'Tag środowiska',
    environment_tag_description:
      'Użyj tagów do odróżniania środowisk wykorzystania najemcy. Usługi w każdym tagu są identyczne, zapewniając spójność.',
    environment_tag_development: 'Rozwój',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Produkcja',
  },
  tenant_created: "Najemca '{{name}}' utworzony pomyślnie.",
};

export default tenants;

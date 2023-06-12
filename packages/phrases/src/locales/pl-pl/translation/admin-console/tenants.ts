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
  delete_modal: {
    title: 'Usuń najemcę',
    description_line1:
      'Czy na pewno chcesz usunąć najemcę "<span>{{name}}</span>" z tagiem sufiksu środowiska "<span>{{tag}}</span>"? Ta operacja jest nieodwracalna i spowoduje trwałe usunięcie wszystkich twoich danych i informacji konta.',
    description_line2:
      'Przed usunięciem konta, może chcemy Ci pomóc. <span><a>Skontaktuj się z nami przez e-mail</a></span>',
    description_line3:
      'Jeśli chcesz kontynuować, wprowadź nazwę najemcy "<span>{{name}}</span>" w celu potwierdzenia.',
    delete_button: 'Usuń na stałe',
  },
  tenant_created: "Najemca '{{name}}' utworzony pomyślnie.",
};

export default tenants;

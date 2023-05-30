const domain = {
  status: {
    connecting: 'Łączenie',
    in_used: 'W użyciu',
    failed_to_connect: 'Nie udało się połączyć',
  },
  update_endpoint_alert: {
    description:
      'Twoja niestandardowa domena została pomyślnie skonfigurowana. Nie zapomnij zaktualizować domeny, którą użyłeś do {{domain}}, jeśli skonfigurowałeś poniższe zasoby wcześniej.',
    endpoint_url: 'Url końcówki <a>{{link}}</a>',
    application_settings_link_text: 'Ustawienia aplikacji',
    callback_url: 'Url zwrotny<a>{{link}}</a>',
    social_connector_link_text: 'Konwerter społecznościowy',
    api_identifier: 'Identyfikator API<a>{{link}}</a>',
    uri_management_api_link_text: 'API zarządzania URI',
    tip: 'Po zmianie ustawień możesz to przetestować w naszym doświadczeniu logowania <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Niestandardowa domena',
    custom_domain_description:
      'Zastąp domyślną domenę swoją własną domeną, aby zachować spójność z Twoją marką i spersonalizować doświadczenie logowania dla swoich użytkowników.',
    custom_domain_field: 'Niestandardowa domena',
    custom_domain_placeholder: 'twojadomena.com',
    add_domain: 'Dodaj domenę',
    invalid_domain_format: 'Niepoprawny format domeny',
    steps: {
      add_records: {
        title: 'Dodaj następujące rekordy DNS do swojego dostawcy DNS',
        generating_dns_records: 'Generowanie rekordów DNS...',
        table: {
          type_field: 'Typ',
          name_field: 'Nazwa',
          value_field: 'Wartość',
        },
        finish_and_continue: 'Zakończ i kontynuuj',
      },
      verify_domain: {
        title: 'Sprawdź połączenie rekordów DNS automatycznie',
        description:
          'Proces zostanie wykonany automatycznie, co może zająć kilka minut (do 24 godzin). Możesz wyjść z tej interfejsu podczas jego działania.',
        error_message: 'Nie udało się zweryfikować. Sprawdź nazwę swojej domeny lub rekordy DNS.',
      },
      generate_ssl_cert: {
        title: 'Wygeneruj automatycznie certyfikat SSL',
        description:
          'Proces zostanie wykonany automatycznie, co może zająć kilka minut (do 24 godzin). Możesz wyjść z tego interfejsu podczas jego działania.',
        error_message: 'Nie udało się wygenerować certyfikacji SSL. ',
      },
      enable_domain: 'Automatycznie włącz swoją niestandardową domenę',
    },
    deletion: {
      delete_domain: 'Usuń domenę',
      reminder: 'Usuń niestandardową domenę',
      description: 'Czy na pewno chcesz usunąć tę niestandardową domenę?',
      in_used_description: 'Czy na pewno chcesz usunąć tę niestandardową domenę "{{domain}}"?',
      in_used_tip:
        'Jeśli skonfigurowałeś tę niestandardową domenę w swoim dostawcy konwerterów społecznościowych lub punkcie końcowym aplikacji wcześniej, musisz najpierw zmodyfikować adres URI na niestandardową domenę Logto "{{domain}}". Jest to konieczne, aby przycisk logowania społecznego działał prawidłowo.',
      deleted: 'Niestandardowa domena została pomyślnie usunięta!',
    },
  },
  default: {
    default_domain: 'Domyślna domena',
    default_domain_description:
      'Oferujemy domenę domyślną, którą można używać bezpośrednio online. Jest zawsze dostępny, zapewniając, że Twoja aplikacja zawsze może być używana do logowania, nawet jeśli przejdziesz na niestandardową domenę.',
    default_domain_field: 'Domyślna domena Logto',
  },
};

export default domain;

const domain = {
  status: {
    connecting: 'Połączenie',
    in_used: 'W użyciu',
    failed_to_connect: 'Nieudane połączenie',
  },
  update_endpoint_alert: {
    description:
      'Twoja niestandardowa domena została pomyślnie skonfigurowana. Nie zapomnij zaktualizować domeny, którą użyłeś do <span>{{domain}}</span>, jeśli skonfigurowałeś poniższe zasoby wcześniej.',
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
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'Dodaj domenę',
    invalid_domain_format:
      'Nieprawidłowy format poddomeny. Wprowadź poddomenę z co najmniej trzema elementami.',
    verify_domain: 'Zweryfikuj domenę',
    enable_ssl: 'Włącz SSL',
    checking_dns_tip:
      'Po skonfigurowaniu rekordów DNS proces zostanie uruchomiony automatycznie i może potrwać do 24 godzin. Możesz opuścić ten interfejs podczas jego działania.',
    generating_dns_records: 'Generowanie rekordów DNS...',
    add_dns_records: 'Dodaj te rekordy DNS do swojego dostawcy DNS.',
    dns_table: {
      type_field: 'Typ',
      name_field: 'Nazwa',
      value_field: 'Wartość',
    },
    deletion: {
      delete_domain: 'Usuń domenę',
      reminder: 'Usuń niestandardową domenę',
      description: 'Czy na pewno chcesz usunąć tę niestandardową domenę?',
      in_used_description:
        'Czy na pewno chcesz usunąć tę niestandardową domenę "<span>{{domain}}</span>"?',
      in_used_tip:
        'Jeśli wcześniej skonfigurowałeś tę niestandardową domenę w dostawcy łączników społecznościowych lub zakończeniu aplikacji, musisz najpierw zmodyfikować adres URI na domyślną domenę Logto "<span>{{domain}}</span>". Jest to niezbędne do poprawnego działania przycisku logowania społecznego.',
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

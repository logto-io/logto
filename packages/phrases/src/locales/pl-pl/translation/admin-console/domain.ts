const domain = {
  status: {
    connecting: 'Łączenie',
    in_used: 'W użyciu',
    failed_to_connect: 'Nieudane połączenie',
  },
  update_endpoint_notice: {
    content:
      'Twoja niestandardowa domena została pomyślnie skonfigurowana. Pamiętaj, aby zaktualizować domenę używaną dla <social-link>{{socialLink}}</social-link> i <app-link>{{appLink}}</app-link>, jeśli wcześniej skonfigurowałeś zasoby.',
    connector_callback_uri_text: 'URI wywołania łącznika społecznego',
    application_text: 'Endpoint Logto dla twojej aplikacji',
  },
  error_hint:
    'Upewnij się, że zaktualizowałeś swoje rekordy DNS. Będziemy nadal sprawdzać co {{value}} sekund.',
  custom: {
    custom_domain: 'Niestandardowa domena',
    custom_domain_description:
      'Zastąp domyślną domenę swoją własną domeną, aby zachować spójność z Twoją marką i spersonalizować doświadczenie logowania dla swoich użytkowników.',
    custom_domain_field: 'Niestandardowa domena',
    custom_domain_placeholder: 'twoja.domena.com',
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

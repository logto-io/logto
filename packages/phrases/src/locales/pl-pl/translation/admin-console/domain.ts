const domain = {
  status: {
    connecting: 'Łączenie...',
    in_use: 'W użyciu',
    failed_to_connect: 'Nieudane połączenie',
  },
  update_endpoint_notice:
    'Nie zapomnij zaktualizować domeny dla URI wywołania łącznika społecznego i punktu końcowego Logto w swojej aplikacji, jeśli chcesz używać niestandardowej domeny dla funkcji. <a>{{link}}</a>',
  error_hint:
    'Upewnij się, że zaktualizowałeś swoje rekordy DNS. Będziemy nadal sprawdzać co {{value}} sekund.',
  custom: {
    custom_domain: 'Niestandardowa domena',
    custom_domain_description:
      'Ulepsz swoją markę, wykorzystując niestandardową domenę. Ta domena będzie używana w Twoim procesie logowania.',
    custom_domain_field: 'Niestandardowa domena',
    custom_domain_placeholder: 'twoja.domena.com',
    add_domain: 'Dodaj domenę',
    invalid_domain_format:
      'Proszę podać poprawny adres URL domeny z co najmniej trzema częściami, np. "twoja.domena.com."',
    verify_domain: 'Zweryfikuj domenę',
    enable_ssl: 'Włącz SSL',
    checking_dns_tip:
      'Po skonfigurowaniu rekordów DNS proces zostanie uruchomiony automatycznie i może potrwać do 24 godzin. Możesz opuścić ten interfejs podczas jego działania.',
    enable_ssl_tip:
      'Włączenie SSL zostanie uruchomione automatycznie i może potrwać do 24 godzin. Możesz opuścić ten interfejs podczas jego działania.',
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
      'Logto oferuje prekonfigurowaną domenę domyślną, gotową do użycia bez dodatkowej konfiguracji. Ta domyślna domena służy jako opcja zapasowa, nawet jeśli włączyłeś niestandardową domenę.',
    default_domain_field: 'Domyślna domena Logto',
  },
  custom_endpoint_note:
    'Możesz dostosować nazwę domeny tych punktów końcowych według swoich wymagań. Wybierz "{{custom}}" lub "{{default}}".',
  custom_social_callback_url_note:
    'Możesz dostosować nazwę domeny tego adresu URI, aby dopasować ją do punktu końcowego Twojej aplikacji. Wybierz "{{custom}}" lub "{{default}}".',
  custom_acs_url_note:
    'Możesz dostosować nazwę domeny tego URI, aby dopasować ją do adresu URL usługi konsumenta oświadczeń Twojego dostawcy tożsamości. Wybierz "{{custom}}" lub "{{default}}".',
};

export default Object.freeze(domain);

const connector_details = {
  page_title: 'Szczegóły konektora',
  back_to_connectors: 'Powrót do konektorów',
  check_readme: 'Sprawdź README',
  settings: 'Ustawienia ogólne',
  settings_description:
    'Konektory odgrywają kluczową rolę w Logto. Dzięki nim, Logto umożliwia użytkownikom końcowym korzystanie z rejestracji lub logowania bez hasła oraz możliwości logowania się za pomocą kont społecznościowych.',
  parameter_configuration: 'Konfiguracja parametru',
  test_connection: 'Test',
  save_error_empty_config: 'Proszę wprowadzić konfigurację',
  send: 'Wyślij',
  send_error_invalid_format: 'Nieprawidłowy format danych wejściowych',
  edit_config_label: 'Wprowadź swoje dane JSON tutaj',
  test_email_sender: 'Wypróbuj konektor e-mail',
  test_sms_sender: 'Wypróbuj konektor SMS',
  test_email_placeholder: 'jan.kowalski@example.com',
  test_sms_placeholder: '+48 123-456-789',
  test_message_sent: 'Wiadomość testowa została wysłana',
  test_sender_description:
    'Logto używa szablonu "Ogólny" do testów. Otrzymasz wiadomość, jeśli twój konektor jest prawidłowo skonfigurowany.',
  options_change_email: 'Zmień konektor e-mail',
  options_change_sms: 'Zmień konektor SMS',
  connector_deleted: 'Konektor został pomyślnie usunięty',
  type_email: 'Konektor e-mail',
  type_sms: 'Konektor SMS',
  type_social: 'Konektor społecznościowy',
  in_used_social_deletion_description:
    'Ten konektor jest używany w Twoim procesie logowania. Usunięcie spowoduje usunięcie doświadczenia logowania <name/> w ustawieniach doświadczenia logowania. Będziesz musiał go ponownie skonfigurować, jeśli zdecydujesz się go dodać z powrotem.',
  in_used_passwordless_deletion_description:
    'Ten {{name}} jest używany w Twoim procesie logowania. Usunięcie spowoduje, że Twoje doświadczenie logowania nie będzie działać poprawnie, dopóki nie rozwiążesz konfliktu. Będziesz musiał go ponownie skonfigurować, jeśli zdecydujesz się go dodać z powrotem.',
  deletion_description:
    'Usuwasz ten konektor. Nie można tego cofnąć, będziesz musiał go ponownie skonfigurować, jeśli zdecydujesz się go ponownie dodać.',
  logto_email: {
    total_email_sent: 'Wysłano łącznie emaili: {{value, number}}',
    total_email_sent_tip:
      'Logto wykorzystuje SendGrid do bezpiecznej i stabilnej wysyłki wbudowanych wiadomości e-mail. Jest to całkowicie darmowe do użytku. <a>Więcej informacji</a>',
    email_template_title: 'Szablon e-maila',
    template_description:
      'Wbudowany e-mail używa domyślnych szablonów dla bezproblemowej dostawy wiadomości weryfikacyjnych. Nie wymaga to konfiguracji, a podstawowe informacje o marce można dostosować.',
    template_description_link_text: 'Wyświetl szablony',
    description_action_text: 'Wyświetl szablony',
    from_email_field: 'Adres e-mail nadawcy',
    sender_name_field: 'Nazwa nadawcy',
    sender_name_tip:
      'Dostosuj nazwę nadawcy dla wiadomości e-mail. Jeśli pozostawisz to pole puste, domyślnie użyta zostanie nazwa "Verification".',
    sender_name_placeholder: 'Nazwa nadawcy',
    company_information_field: 'Informacje o firmie',
    company_information_description:
      'Wyświetlaj nazwę firmy, adres lub kod pocztowy na dole wiadomości e-mail, aby zwiększyć autentyczność.',
    company_information_placeholder: 'Podstawowe informacje o Twojej firmie',
    email_logo_field: 'Logo e-mail',
    email_logo_tip:
      'Wyświetl logo swojej marki na górze wiadomości e-mail. Użyj tego samego obrazu zarówno dla trybu jasnego, jak i ciemnego.',
    urls_not_allowed: 'Nie dozwolone adresy URL',
    test_notes: 'Logto używa szablonu "Ogólny" do testów.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap to bezpieczny i łatwy sposób, by użytkownicy mogli zalogować się na Twoją stronę.',
    enable_google_one_tap: 'Włącz Google One Tap',
    enable_google_one_tap_description:
      'Włącz Google One Tap w swoim doświadczeniu logowania: Pozwól użytkownikom szybko się zarejestrować lub zalogować za pomocą ich konta Google, jeśli są już zalogowani na swoim urządzeniu.',
    configure_google_one_tap: 'Skonfiguruj Google One Tap',
    auto_select: 'Automatyczny wybór poświadczenia, jeśli to możliwe',
    close_on_tap_outside: 'Anuluj monit, jeśli użytkownik kliknie/tapnie na zewnątrz',
    itp_support: 'Włącz <a>ulepszony UX One Tap dla przeglądarek ITP</a>',
  },
};

export default Object.freeze(connector_details);

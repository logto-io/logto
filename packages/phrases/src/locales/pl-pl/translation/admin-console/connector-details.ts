const connector_details = {
  page_title: 'Szczegóły konektora',
  back_to_connectors: 'Powrót do konektorów',
  check_readme: 'Sprawdź README',
  settings: 'Ustawienia ogólne',
  settings_description:
    'Konektory odgrywają kluczową rolę w Logto. Dzięki nim, Logto umożliwia użytkownikom końcowym korzystanie z rejestracji lub logowania bez hasła oraz możliwości logowania się za pomocą kont społecznościowych.',
  parameter_configuration: 'Konfiguracja parametru',
  test_connection: 'Testuj połączenie',
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
};

export default connector_details;

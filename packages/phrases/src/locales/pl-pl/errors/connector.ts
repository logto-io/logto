const connector = {
  general: 'Wystąpił błąd włącznika: {{errorDescription}}',
  not_found: 'Nie można znaleźć dostępnego łącznika dla typu: {{type}}.',
  not_enabled: 'Łącznik nie jest włączony.',
  invalid_metadata: 'Metadane łącznika są nieprawidłowe.',
  invalid_config_guard: 'Ochrona konfiguracji łącznika jest nieprawidłowa.',
  unexpected_type: 'Typ łącznika jest nieoczekiwany.',
  invalid_request_parameters:
    'Żądanie jest z nieprawidłowym parametrem wejściowym/lub parametrami wejściowymi.',
  insufficient_request_parameters: 'Żądanie może nie zawierać niektórych parametrów wejściowych.',
  invalid_config: 'Konfiguracja łącznika jest nieprawidłowa.',
  invalid_response: 'Odpowiedź łącznika jest nieprawidłowa.',
  template_not_found: 'Nie można znaleźć poprawnego szablonu w konfiguracji łącznika.',
  not_implemented: '{{method}}: jeszcze nie zaimplementowano.',
  social_invalid_access_token: 'Token dostępu łącznika jest nieprawidłowy.',
  invalid_auth_code: 'Kod autoryzacji łącznika jest nieprawidłowy.',
  social_invalid_id_token: 'Token ID łącznika jest nieprawidłowy.',
  authorization_failed: 'Proces autoryzacji użytkownika zakończył się niepowodzeniem.',
  social_auth_code_invalid:
    'Nie udało się uzyskać tokenu dostępu, proszę sprawdzić kod autoryzacji.',
  more_than_one_sms: 'Ilość łączników SMS jest większa niż 1.',
  more_than_one_email: 'Ilość łączników e-mail jest większa niż 1.',
  more_than_one_connector_factory:
    'Znaleziono wiele fabryk łączników (z id {{connectorIds}}), możesz odinstalować niepotrzebne.',
  db_connector_type_mismatch: 'W bazie danych znajduje się łącznik, który nie pasuje do typu.',
  not_found_with_connector_id:
    'Nie można odnaleźć łącznika o podanym standardowym identyfikatorze łącznika.',
  multiple_instances_not_supported:
    'Nie można utworzyć wielu instancji z wybranym standardowym łącznikiem.',
  invalid_type_for_syncing_profile:
    'Możesz tylko synchronizować profil użytkownika z łącznikami społecznościowymi.',
  can_not_modify_target: "Nie można modyfikować 'target' łącznika.",
  should_specify_target: "Powinieneś/nna/lno określić 'target'.",
  multiple_target_with_same_platform:
    "Nie można mieć wielu łączników społecznościowych z takim samym 'platforma i target'.",
  cannot_overwrite_metadata_for_non_standard_connector:
    'Nie można nadpisać "metadata" tego łącznika, który nie należy do standardu.',
};

export default connector;

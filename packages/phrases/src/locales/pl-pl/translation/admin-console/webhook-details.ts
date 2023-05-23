const webhook_details = {
  page_title: 'Szczegóły webhooka',
  back_to_webhooks: 'Wróć do Webhooks',
  not_in_use: 'Nieaktywne',
  success_rate: 'Stosunek sukcesów',
  requests: '{{value, number}} żądań w ciągu 24h',
  disable_webhook: 'Wyłącz webhook',
  disable_reminder:
    'Czy na pewno chcesz przestać wyłączać ten webhook? Taki postęp nie będzie wysyłał żądania HTTP do adresu URL końcowego.',
  webhook_disabled: 'Webhook został wyłączony.',
  webhook_reactivated: 'Webhook został ponownie aktywowany.',
  reactivate_webhook: 'Aktywuj ponownie webhooka',
  delete_webhook: 'Usuń webhook',
  deletion_reminder:
    'Usuwasz ten webhook. Po jego usunięciu nie będzie wysyłany żaden żądanie HTTP do adresu URL końcowego.',
  deleted: 'Webhook został pomyślnie usunięty.',
  settings_tab: 'Ustawienia',
  recent_requests_tab: 'Najnowsze żądania (24h)',
  settings: {
    settings: 'Ustawienia',
    settings_description:
      'Webhootsy pozwalają na otrzymywanie aktualizacji w czasie rzeczywistym z określonych zdarzeń, wysyłając żądanie POST na Twój adres URL końcowy. Dzięki temu możesz natychmiast podjąć działania na podstawie otrzymanych nowych informacji.',
    events: 'Zdarzenia',
    events_description: 'Wybierz zdarzenia wywołujące, które Logto wyśle żądanie POST.',
    name: 'Nazwa',
    endpoint_url: 'Adres URL końcowego',
    endpoint_url_tip:
      'Wpisz adres URL protokołu HTTPS Twojego endpointu, na który webhook wysyła ładunek, gdy występuje zdarzenie.',
    signing_key: 'Klucz podpisu',
    signing_key_tip:
      'Dodaj klucz sekretny dostarczony przez Logto do swojego endpointu jako nagłówek żądania, aby zapewnić autentyczność ładunku webhooka.',
    regenerate: 'Przebuduj',
    regenerate_key_title: 'Wygeneruj ponownie klucz podpisu',
    regenerate_key_reminder:
      'Czy na pewno chcesz zmodyfikować klucz podpisu? Regenerowanie spowoduje natychmiastowe wprowadzenie zmian. Pamiętaj, aby synchronicznie zmienić klucz podpisu w swoim endpointcie.',
    regenerated: 'Klucz podpisu został przebudowany.',
    custom_headers: 'Niestandardowe nagłówki',
    custom_headers_tip:
      'Opcjonalnie możesz dodać niestandardowe nagłówki w ładunku webhooka, aby dostarczyć dodatkowy kontekst lub metadane na temat zdarzenia.',
    key_duplicated_error: 'Klucze nie mogą się powtarzać.',
    key_missing_error: 'Klucz jest wymagany.',
    value_missing_error: 'Wartość jest wymagana.',
    test: 'Test',
    test_webhook: 'Wypróbuj swój webhook',
    test_webhook_description:
      'Uzupełnij konfigurację webhooka powyżej. Kliknij przycisk testowy, a my wyślemy indywidualne przykłady ładunków każdego wybranego zdarzenia na Twój adres URL końcowy. To pozwoli Ci zweryfikować, czy Twój endpoint poprawnie otrzymuje i przetwarza ładunki.',
    send_test_payload: 'Wyślij testowy ładunek',
    test_payload_sent: 'Ladunek został pomyślnie wysłany!',
  },
};

export default webhook_details;

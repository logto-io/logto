const protected_app = {
  name: 'Aplikacja chroniona',
  title:
    'Stwórz aplikację zabezpieczoną: Dodaj uwierzytelnienie w prosty sposób i z dużą prędkością',
  fast_create: 'Szybkie tworzenie',
  modal_title: 'Utwórz aplikację chronioną',
  modal_subtitle:
    'Włącz bezpieczną i szybką ochronę za pomocą kilku kliknięć. Dodaj uwierzytelnienie do istniejącej aplikacji internetowej z łatwością.',
  form: {
    url_field_label: 'Twój adres URL źródłowy',
    url_field_placeholder: 'https://domena.com/',
    url_field_description: 'Podaj adres swojej aplikacji wymagającej ochrony uwierzytelnienia.',
    url_field_modification_notice:
      'Modyfikacje w adresie URL źródłowym mogą potrwać od 1 do 2 minut, aby zacząć działać na całym globalnym sieciowym miejscu.',
    url_field_tooltip:
      "Podaj adres swojej aplikacji, pomijając wszelkie '/ścieżki'. Po utworzeniu możesz dostosować zasady uwierzytelniania trasy.\n\nUwaga: Sam adres URL źródłowy nie wymaga uwierzytelnienia; ochrona jest stosowana wyłącznie do dostępów poprzez wyznaczoną domenę aplikacji.",
    domain_field_label: 'Domena aplikacji',
    domain_field_placeholder: 'twoja-domena',
    domain_field_description:
      'Ten adres URL służy jako proxy ochrony uwierzytelnienia dla oryginalnego URL. Domena niestandardowa może zostać zastosowana po utworzeniu.',
    domain_field_description_short:
      'Ten adres URL służy jako proxy ochrony uwierzytelnienia dla oryginalnego URL.',
    domain_field_tooltip:
      "Aplikacje chronione przez Logto będą hostowane domyślnie pod adresem 'twoja-domena.{{domain}}'. Domena niestandardowa może zostać zastosowana po utworzeniu.",
    create_application: 'Stwórz aplikację',
    create_protected_app: 'Szybkie tworzenie',
    errors: {
      domain_required: 'Twoja domena jest wymagana.',
      domain_in_use: 'Ta nazwa poddomeny jest już w użyciu.',
      invalid_domain_format:
        "Nieprawidłowy format poddomeny: użyj tylko małych liter, liczb i myślników '-'.",
      url_required: 'Adres URL źródłowy jest wymagany.',
      invalid_url:
        "Nieprawidłowy format adresu URL źródłowego: Użyj http:// lub https://. Uwaga: '/ścieżka' nie jest obecnie obsługiwana.",
      localhost:
        'Najpierw wystaw swój lokalny serwer do internetu. Dowiedz się więcej o <a>lokalnym rozwoju</a>.',
    },
  },
  id_token_claims: {
    card_title: 'Claims ID tokena',
    card_description:
      'Żądaj dodatkowych scope użytkownika podczas logowania do chronionej aplikacji, aby uwzględnić włączone rozszerzone claims w przesyłanym ID tokenie.',
    field_title: 'Dodatkowe scope',
    field_description:
      'Claims są uwzględniane tylko wtedy, gdy są włączone w <a>Custom JWT > ID token</a> i odpowiadający scope został tutaj zażądany.',
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'Przesyłane claims',
    disabled_claims_hint:
      'Wyszarzone claims nie są jeszcze przesyłane. Włącz je w <a>Custom JWT > ID token</a>, aby uwzględnić je w ID tokenie.',
  },
  success_message:
    '🎉 Uwierzytelnienie aplikacji pomyślnie włączone! Odkryj nowe doświadczenia Twojej strony internetowej.',
};

export default Object.freeze(protected_app);

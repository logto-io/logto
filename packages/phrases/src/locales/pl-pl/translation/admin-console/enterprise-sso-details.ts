const enterprise_sso_details = {
  back_to_sso_connectors: 'Powrót do jednokrotnego logowania przedsiębiorstwa',
  page_title: 'Szczegóły konektora jednokrotnego logowania przedsiębiorstwa',
  readme_drawer_title: 'Jednokrotne logowanie przedsiębiorstwa',
  readme_drawer_subtitle:
    'Skonfiguruj konektory jednokrotnego logowania przedsiębiorstwa, aby umożliwić jednokrotne logowanie końcowym użytkownikom',
  tab_experience: 'Doświadczenie SSO',
  tab_connection: 'Połączenie',
  tab_idp_initiated_auth: 'IdP zainicjowane SSO',
  general_settings_title: 'Ogólne',
  general_settings_description:
    'Skonfiguruj doświadczenie użytkownika końcowego i połącz domenę e-mail przedsiębiorstwa dla przepływu SSO zainicjowanego przez SP.',
  custom_branding_title: 'Wyświetlanie',
  custom_branding_description:
    'Dostosuj nazwę i logo wyświetlane w przepływie jednokrotnego logowania końcowych użytkowników. Przy braku wartości domyślne są używane.',
  email_domain_field_name: 'Domena e-mail przedsiębiorstwa',
  email_domain_field_description:
    'Użytkownicy z tą domeną e-mail mogą używać SSO do uwierzytelniania. Proszę zweryfikować, czy domena należy do przedsiębiorstwa.',
  email_domain_field_placeholder: 'Domena e-mail',
  sync_profile_field_name: 'Synchronizuj informacje profilu z dostawcy tożsamości',
  sync_profile_option: {
    register_only: 'Tylko synchronizuj przy pierwszym logowaniu',
    each_sign_in: 'Zawsze synchronizuj przy każdym logowaniu',
  },
  connector_name_field_name: 'Nazwa konektora',
  display_name_field_name: 'Nazwa wyświetlana',
  connector_logo_field_name: 'Logo wyświetlane',
  connector_logo_field_description:
    'Każdy obraz powinien mieć mniej niż 500KB, tylko SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Prześlij logo',
  branding_logo_error: 'Błąd przesyłania logo: {{error}}',
  branding_light_logo_context: 'Prześlij logo w trybie jasnym',
  branding_light_logo_error: 'Błąd przesyłania logo w trybie jasnym: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://twoja.domena/logo.png',
  branding_dark_logo_context: 'Prześlij logo w trybie ciemnym',
  branding_dark_logo_error: 'Błąd przesyłania logo w trybie ciemnym: {{error}}',
  branding_dark_logo_field_name: 'Logo (tryb ciemny)',
  branding_dark_logo_field_placeholder: 'https://twoja.domena/logo-tryb-ciemny.png',
  check_connection_guide: 'Poradnik połączenia',
  enterprise_sso_deleted:
    'Konektor jednokrotnego logowania przedsiębiorstwa został pomyślnie usunięty',
  delete_confirm_modal_title: 'Usuń konektor jednokrotnego logowania przedsiębiorstwa',
  delete_confirm_modal_content:
    'Czy na pewno chcesz usunąć ten konektor przedsiębiorstwa? Użytkownicy z dostawców tożsamości nie będą korzystać z jednokrotnego logowania.',
  upload_idp_metadata_title_saml: 'Prześlij metadane',
  upload_idp_metadata_description_saml: 'Skonfiguruj metadane skopiowane z dostawcy tożsamości.',
  upload_idp_metadata_title_oidc: 'Prześlij dane uwierzytelniania',
  upload_idp_metadata_description_oidc:
    'Skonfiguruj dane uwierzytelniania i informacje o tokenie OIDC skopiowane z dostawcy tożsamości.',
  upload_idp_metadata_button_text: 'Prześlij plik XML metadanych',
  upload_signing_certificate_button_text: 'Prześlij plik certyfikatu podpisującego',
  configure_domain_field_info_text:
    'Dodaj domenę e-mail, aby przeprowadzić użytkowników przedsiębiorstwa do ich dostawcy tożsamości dla jednokrotnego logowania.',
  email_domain_field_required: 'Domena e-mail jest wymagana do włączenia SSO dla przedsiębiorstwa.',
  upload_saml_idp_metadata_info_text_url:
    'Wklej URL metadanych z dostawcy tożsamości, aby połączyć.',
  upload_saml_idp_metadata_info_text_xml: 'Wklej metadane z dostawcy tożsamości, aby połączyć.',
  upload_saml_idp_metadata_info_text_manual:
    'Wypełnij metadane z dostawcy tożsamości, aby połączyć.',
  upload_oidc_idp_info_text: 'Wypełnij informacje z dostawcy tożsamości, aby połączyć.',
  service_provider_property_title: 'Konfiguruj w IdP',
  service_provider_property_description:
    'Skonfiguruj integrację aplikacji za pomocą {{protocol}} w dostawcy tożsamości. Wprowadź szczegóły podane przez Logto.',
  attribute_mapping_title: 'Mapowanie atrybutów',
  attribute_mapping_description:
    'Synchronizuj profile użytkowników z dostawcy tożsamości, konfigurując mapowanie atrybutów użytkownika zarówno po stronie dostawcy tożsamości, jak i po stronie Logto.',
  saml_preview: {
    sign_on_url: 'URL logowania',
    entity_id: 'Wydawca',
    x509_certificate: 'Certyfikat podpisujący',
    certificate_content: 'Wygasa: {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Punkt końcowy autoryzacji',
    token_endpoint: 'Punkt końcowy tokena',
    userinfo_endpoint: 'Punkt końcowy informacji użytkownika',
    jwks_uri: 'Punkt końcowy kluczy web JSON',
    issuer: 'Wydawca',
  },
  idp_initiated_auth_config: {
    card_title: 'IdP zainicjowane SSO',
    card_description:
      'Użytkownik zazwyczaj rozpoczyna proces uwierzytelniania z aplikacji przy użyciu przepływu SP-zainicjowanego SSO. NIE włączaj tej funkcji, chyba że jest to absolutnie konieczne.',
    enable_idp_initiated_sso: 'Włącz IdP zainicjowane SSO',
    enable_idp_initiated_sso_description:
      'Pozwól użytkownikom przedsiębiorstwa rozpocząć proces uwierzytelniania bezpośrednio z portalu dostawcy tożsamości. Proszę zrozumieć potencjalne ryzyko bezpieczeństwa przed włączeniem tej funkcji.',
    default_application: 'Aplikacja domyślna',
    default_application_tooltip:
      'Docelowa aplikacja, do której użytkownik zostanie przekierowany po uwierzytelnieniu.',
    empty_applications_error:
      'Nie znaleziono aplikacji. Proszę dodać jedną w sekcji <a>Applications</a>.',
    empty_applications_placeholder: 'Brak aplikacji',
    authentication_type: 'Rodzaj uwierzytelniania',
    auto_authentication_disabled_title: 'Przekieruj do klienta dla SP-zainicjowanego SSO',
    auto_authentication_disabled_description:
      'Zalecane. Przekieruj użytkowników do aplikacji po stronie klienta, aby zainicjować bezpieczne uwierzytelnianie OIDC zainicjowane przez SP. Zapobiegnie to atakom CSRF.',
    auto_authentication_enabled_title: 'Zaloguj się bezpośrednio używając IdP zainicjowanego SSO',
    auto_authentication_enabled_description:
      'Po pomyślnym zalogowaniu użytkownicy zostaną przekierowani do określonego URI przekierowania z kodem autoryzacji (bez walidacji stanu i PKCE).',
    auto_authentication_disabled_app:
      'Dla tradycyjnych aplikacji web, aplikacji jednostronicowych (SPA)',
    auto_authentication_enabled_app: 'Dla tradycyjnych aplikacji web',
    idp_initiated_auth_callback_uri: 'Klient URI zwrotne',
    idp_initiated_auth_callback_uri_tooltip:
      'URI zwrotne klienta do zainicjowania przepływu autoryzacji SSO zainicjowanej przez SP. Identyfikator ssoConnectorId zostanie dołączony do URI jako parametr zapytania. (np. https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'URI przekierowania po zalogowaniu',
    redirect_uri_tooltip:
      'URI przekierowania użytkowników po pomyślnym zalogowaniu. Logto użyje tego URI jako URI przekierowania OIDC w żądaniu autoryzacji. Użyj dedykowanego URI dla przepływu uwierzytelniania SSO zainicjowanego IdP dla lepszego bezpieczeństwa.',
    empty_redirect_uris_error:
      'Nie zarejestrowano żadnego URI przekierowania dla aplikacji. Proszę najpierw dodać.',
    redirect_uri_placeholder: 'Wybierz URI przekierowania po zalogowaniu',
    auth_params: 'Dodatkowe parametry uwierzytelniania',
    auth_params_tooltip:
      'Dodatkowe parametry do przekazania w żądaniu autoryzacji. Domyślnie domyślnie będą żądane tylko zakresy (openid profile), możesz tutaj określić dodatkowe zakresy lub wyłączną wartość stanu. (np. { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Ufaj niezweryfikowanym adresom e-mail',
  trust_unverified_email_label:
    'Zawsze ufaj niezweryfikowanym adresom e-mail zwróconym przez dostawcę tożsamości',
  trust_unverified_email_tip:
    'Konektor Entra ID (OIDC) nie zwraca zgłoszenia `email_verified`, co oznacza, że adresy e-mail z Azure nie są gwarantowane jako zweryfikowane. Domyślnie Logto nie będzie synchronizować niezweryfikowanych adresów e-mail z profilem użytkownika. Włącz tę opcję tylko wtedy, gdy ufasz wszystkim adresom e-mail w katalogu Entra ID.',
  offline_access: {
    label: 'Odśwież token dostępu',
    description:
      'Włącz Google „offline” dostęp do żądania tokenu odświeżenia, co pozwala twojej aplikacji na odświeżenie tokenu dostępu bez ponownej autoryzacji użytkownika.',
  },
};

export default Object.freeze(enterprise_sso_details);

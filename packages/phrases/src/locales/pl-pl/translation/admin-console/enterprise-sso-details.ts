const enterprise_sso_details = {
  back_to_sso_connectors: 'Powrót do jednokrotnego logowania przedsiębiorstwa',
  page_title: 'Szczegóły konektora jednokrotnego logowania przedsiębiorstwa',
  readme_drawer_title: 'Jednokrotne logowanie przedsiębiorstwa',
  readme_drawer_subtitle:
    'Skonfiguruj konektory jednokrotnego logowania przedsiębiorstwa, aby umożliwić jednokrotne logowanie końcowym użytkownikom',
  tab_experience: 'Doświadczenie SSO',
  tab_connection: 'Połączenie',
  general_settings_title: 'Ogólne',
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
};

export default Object.freeze(enterprise_sso_details);

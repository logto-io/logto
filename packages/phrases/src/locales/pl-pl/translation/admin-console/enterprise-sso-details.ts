const enterprise_sso_details = {
  back_to_sso_connectors: 'Powrót do jednolitego logowania dla przedsiębiorstw',
  page_title: 'Szczegóły konektora dla jednolitego logowania dla przedsiębiorstw',
  readme_drawer_title: 'Jednolite logowanie dla przedsiębiorstw',
  readme_drawer_subtitle:
    'Skonfiguruj konektory jednolitego logowania dla uruchomienia jednolitego logowania użytkowników końcowych',
  tab_settings: 'Ustawienia',
  tab_connection: 'Połączenie',
  general_settings_title: 'Ustawienia ogólne',
  custom_branding_title: 'Dostosowywanie marki',
  custom_branding_description:
    'Dostosuj informacje wyświetlanego IdP przedsiębiorstwa dla przycisku logowania i innych scenariuszy.',
  email_domain_field_name: 'Domena e-mail przedsiębiorstwa',
  email_domain_field_description:
    'Użytkownicy z tą domeną e-mail mogą korzystać z jednolitego logowania dla uwierzytelniania. Proszę upewnij się, że domena należy do przedsiębiorstwa.',
  email_domain_field_placeholder: 'Domena e-mail',
  sync_profile_field_name: 'Synchronizacja informacji profilu z dostawcą tożsamości',
  sync_profile_option: {
    register_only: 'Tylko synchronizuj przy pierwszym zalogowaniu się',
    each_sign_in: 'Zawsze synchronizuj przy każdym logowaniu',
  },
  connector_name_field_name: 'Nazwa konektora',
  connector_logo_field_name: 'Logo konektora',
  branding_logo_context: 'Prześlij logo',
  branding_logo_error: 'Błąd podczas przesyłania logo: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://twoja.domena/logo.png',
  branding_dark_logo_context: 'Prześlij logo w trybie ciemnym',
  branding_dark_logo_error: 'Błąd podczas przesyłania logo w trybie ciemnym: {{error}}',
  branding_dark_logo_field_name: 'Logo (tryb ciemny)',
  branding_dark_logo_field_placeholder: 'https://twoja.domena/logo-w-trybie-ciemnym.png',
  check_readme: 'Sprawdź README',
  enterprise_sso_deleted:
    'Konektor jednolitego logowania dla przedsiębiorstw został pomyślnie usunięty',
  delete_confirm_modal_title: 'Usuń konektor jednolitego logowania dla przedsiębiorstw',
  delete_confirm_modal_content:
    'Czy na pewno chcesz usunąć ten konektor przedsiębiorstwa? Użytkownicy z dostawców tożsamości nie będą korzystać z jednolitego logowania.',
  upload_idp_metadata_title: 'Prześlij metadane IdP',
  upload_idp_metadata_description: 'Skonfiguruj metadane skopiowane z dostawcy tożsamości.',
  upload_saml_idp_metadata_info_text_url:
    'Wklej adres URL metadanych z dostawcy tożsamości, aby połączyć.',
  upload_saml_idp_metadata_info_text_xml: 'Wklej metadane z dostawcy tożsamości, aby połączyć.',
  upload_saml_idp_metadata_info_text_manual:
    'Wypełnij metadane z dostawcy tożsamości, aby połączyć.',
  upload_oidc_idp_info_text: 'Wypełnij informacje z dostawcy tożsamości, aby połączyć.',
  service_provider_property_title: 'Skonfiguruj swoją usługę w IdP',
  service_provider_property_description:
    'Utwórz nową integrację aplikacji na {{protocol}} w {{name}}. Następnie wklej poniższe szczegóły usługi dla skonfigurowania {{protocol}}.',
  attribute_mapping_title: 'Mapowanie atrybutów',
  attribute_mapping_description:
    'Identyfikator i adres e-mail użytkownika są wymagane do synchronizacji profilu użytkownika z IdP. Wprowadź podane nazwy i wartości w {{name}}.',
  saml_preview: {
    sign_on_url: 'Adres URL logowania',
    entity_id: 'Wydawca',
    x509_certificate: 'Certyfikat podpisowy',
  },
  oidc_preview: {
    authorization_endpoint: 'Punkt końcowy autoryzacji',
    token_endpoint: 'Punkt końcowy tokena',
    userinfo_endpoint: 'Punkt końcowy informacji o użytkowniku',
    jwks_uri: 'Punkt końcowy zestawu kluczy JSON web',
    issuer: 'Wydawca',
  },
};

export default Object.freeze(enterprise_sso_details);

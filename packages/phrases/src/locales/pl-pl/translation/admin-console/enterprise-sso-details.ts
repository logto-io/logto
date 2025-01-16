const enterprise_sso_details = {
  back_to_sso_connectors: 'Powrót do jednokrotnego logowania przedsiębiorstwa',
  page_title: 'Szczegóły konektora jednokrotnego logowania przedsiębiorstwa',
  readme_drawer_title: 'Jednokrotne logowanie przedsiębiorstwa',
  readme_drawer_subtitle:
    'Skonfiguruj konektory jednokrotnego logowania przedsiębiorstwa, aby umożliwić jednokrotne logowanie końcowym użytkownikom',
  tab_experience: 'Doświadczenie SSO',
  tab_connection: 'Połączenie',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
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
  idp_initiated_auth_config: {
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);

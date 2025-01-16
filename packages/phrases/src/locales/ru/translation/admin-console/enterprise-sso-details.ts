const enterprise_sso_details = {
  back_to_sso_connectors: 'Вернуться к единой системе аутентификации предприятия',
  page_title: 'Подробности коннектора единой системы аутентификации предприятия',
  readme_drawer_title: 'Единая система аутентификации предприятия',
  readme_drawer_subtitle:
    'Настройте коннекторы единой системы аутентификации предприятия для включения единого входа пользователей',
  tab_experience: 'Опыт единого входа',
  tab_connection: 'Подключение',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: 'Общие настройки',
  custom_branding_title: 'Отображение',
  custom_branding_description:
    'Настройте имя и логотип, отображаемые в потоке единого входа для конечных пользователей. При пустом значении используются значения по умолчанию.',
  email_domain_field_name: 'Домен электронной почты предприятия',
  email_domain_field_description:
    'Пользователи с этим доменом электронной почты могут использовать единую систему аутентификации для аутентификации. Пожалуйста, убедитесь, что домен принадлежит предприятию.',
  email_domain_field_placeholder: 'Домен электронной почты',
  sync_profile_field_name: 'Синхронизация профиля информации из поставщика идентичности',
  sync_profile_option: {
    register_only: 'Синхронизировать только при первом входе',
    each_sign_in: 'Всегда синхронизировать при каждом входе',
  },
  connector_name_field_name: 'Имя коннектора',
  display_name_field_name: 'Отображаемое имя',
  connector_logo_field_name: 'Отображаемый логотип',
  connector_logo_field_description:
    'Каждое изображение должно быть не более 500KB в форматах SVG, PNG, JPG, JPEG.',
  branding_logo_context: 'Загрузить логотип',
  branding_logo_error: 'Ошибка загрузки логотипа: {{error}}',
  branding_light_logo_context: 'Загрузить логотип в светлом режиме',
  branding_light_logo_error: 'Ошибка загрузки логотипа в светлом режиме: {{error}}',
  branding_logo_field_name: 'Логотип',
  branding_logo_field_placeholder: 'https://ваш.домен/логотип.png',
  branding_dark_logo_context: 'Загрузить логотип в темном режиме',
  branding_dark_logo_error: 'Ошибка загрузки логотипа в темном режиме: {{error}}',
  branding_dark_logo_field_name: 'Логотип (темный режим)',
  branding_dark_logo_field_placeholder: 'https://ваш.домен/логотип-темного-режима.png',
  check_connection_guide: 'Руководство по подключению',
  enterprise_sso_deleted: 'Коннектор единой системы аутентификации предприятия успешно удален',
  delete_confirm_modal_title: 'Удалить коннектор единой системы аутентификации предприятия',
  delete_confirm_modal_content:
    'Вы уверены, что хотите удалить этот коннектор предприятия? Пользователи от поставщиков идентичности не будут использовать единую систему аутентификации.',
  upload_idp_metadata_title_saml: 'Загрузить метаданные',
  upload_idp_metadata_description_saml:
    'Настройте метаданные, скопированные из поставщика идентичности.',
  upload_idp_metadata_title_oidc: 'Загрузить учетные данные',
  upload_idp_metadata_description_oidc:
    'Настройте учетные данные и информацию об OIDC-токене, скопированные из поставщика идентичности.',
  upload_idp_metadata_button_text: 'Загрузить файл метаданных XML',
  upload_signing_certificate_button_text: 'Загрузить файл сертификата подписи',
  configure_domain_field_info_text:
    'Добавьте домен электронной почты, чтобы направить предприятийзапросы к поставщику идентичности для единого входа.',
  email_domain_field_required:
    'Требуется домен электронной почты для включения единой системы аутентификации предприятия.',
  upload_saml_idp_metadata_info_text_url:
    'Вставьте URL метаданных от поставщика идентичности для подключения.',
  upload_saml_idp_metadata_info_text_xml:
    'Вставьте метаданные от поставщика идентичности для подключения.',
  upload_saml_idp_metadata_info_text_manual:
    'Заполните метаданные от поставщика идентичности для подключения.',
  upload_oidc_idp_info_text: 'Заполните информацию от поставщика идентичности для подключения.',
  service_provider_property_title: 'Настройка в поставщике идентичности',
  service_provider_property_description:
    'Настройте интеграцию приложения, используя {{protocol}} в вашем поставщике идентичности. Введите детали, предоставленные Logto.',
  attribute_mapping_title: 'Отображение атрибутов',
  attribute_mapping_description:
    'Синхронизация профилей пользователей из поставщика идентичности путем настройки отображения атрибутов пользователя либо на стороне поставщика идентичности, либо на стороне Logto.',
  saml_preview: {
    sign_on_url: 'URL входа',
    entity_id: 'Издатель',
    x509_certificate: 'Сертификат подписи',
    certificate_content: 'Истекает {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Конечная точка авторизации',
    token_endpoint: 'Конечная точка токена',
    userinfo_endpoint: 'Конечная точка информации о пользователе',
    jwks_uri: 'Конечная точка набора ключей JSON Web',
    issuer: 'Издатель',
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

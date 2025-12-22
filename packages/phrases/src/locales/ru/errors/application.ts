const application = {
  invalid_type: 'Только приложения типа "от машины к машине" могут иметь связанные роли.',
  role_exists: 'Роль с идентификатором {{roleId}} уже добавлена в это приложение.',
  invalid_role_type:
    'Невозможно назначить роль типа "пользователь" для приложения типа "от машины к машине".',
  invalid_third_party_application_type:
    'Только традиционные веб-приложения, одностраничные и нативные приложения могут быть помечены как приложения сторонних разработчиков.',
  third_party_application_only:
    'Эта функция доступна только для приложений сторонних разработчиков.',
  user_consent_scopes_not_found: 'Недействительные области согласия пользователя.',
  consent_management_api_scopes_not_allowed: 'API-области управления не разрешены.',
  protected_app_metadata_is_required: 'Требуется защищенная метаданные приложения.',
  protected_app_not_configured:
    'Поставщик защищенного приложения не настроен. Эта функция недоступна для версии с открытым исходным кодом.',
  cloudflare_unknown_error: 'Получена неизвестная ошибка при запросе к API Cloudflare',
  protected_application_only: 'Эта функция доступна только для защищенных приложений.',
  protected_application_misconfigured: 'Защищенное приложение настроено неверно.',
  protected_application_subdomain_exists: 'Поддомен защищенного приложения уже используется.',
  invalid_subdomain: 'Недопустимый поддомен.',
  custom_domain_not_found: 'Пользовательский домен не найден.',
  should_delete_custom_domains_first: 'Сначала следует удалить пользоватские домены.',
  no_legacy_secret_found: 'Приложение не имеет устаревшего секрета.',
  secret_name_exists: 'Имя секрета уже существует.',
  saml: {
    use_saml_app_api:
      'Используйте API `[METHOD] /saml-applications(/.*)?`, чтобы управлять приложением SAML.',
    saml_application_only: 'Этот API доступен только для приложений SAML.',
    reach_oss_limit:
      'Вы не можете создать больше приложений SAML, так как достигнут лимит {{limit}}.',
    acs_url_binding_not_supported:
      'Только HTTP-POST привязка поддерживается для получения утверждений SAML.',
    can_not_delete_active_secret: 'Невозможно удалить активный секрет.',
    no_active_secret: 'Активный секрет не найден.',
    entity_id_required: 'Для создания метаданных требуется идентификатор сущности.',
    name_id_format_required: 'Требуется формат идентификатора имени.',
    unsupported_name_id_format: 'Неподдерживаемый формат идентификатора имени.',
    missing_email_address: 'У пользователя нет адреса электронной почты.',
    email_address_unverified: 'Адрес электронной почты пользователя не подтвержден.',
    invalid_certificate_pem_format: 'Неверный формат сертификата PEM.',
    acs_url_required: 'Требуется URL сервиса потребителя утверждений.',
    private_key_required: 'Требуется закрытый ключ.',
    certificate_required: 'Требуется сертификат.',
    invalid_saml_request: 'Неверный запрос аутентификации SAML.',
    auth_request_issuer_not_match:
      'Издатель запроса аутентификации SAML не совпадает с идентификатором сущности поставщика услуг.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Идентификатор сеанса SSO, инициированного поставщиком услуг, SAML не найден в файлах cookie.',
    sp_initiated_saml_sso_session_not_found:
      'Сеанс SSO, инициированный поставщиком услуг, SAML не найден.',
    state_mismatch: 'Несоответствие `state`.',
  },
};

export default Object.freeze(application);

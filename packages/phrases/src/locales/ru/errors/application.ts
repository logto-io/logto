const application = {
  invalid_type: 'Только приложения типа "от машины к машине" могут иметь связанные роли.',
  role_exists: 'Роль с идентификатором {{roleId}} уже добавлена в это приложение.',
  invalid_role_type:
    'Невозможно назначить роль типа "пользователь" для приложения типа "от машины к машине".',
  invalid_third_party_application_type:
    'Только традиционные веб-приложения могут быть помечены как приложения сторонних разработчиков.',
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
};

export default Object.freeze(application);

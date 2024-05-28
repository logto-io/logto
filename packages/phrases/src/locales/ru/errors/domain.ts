const domain = {
  not_configured: 'Провайдер доменных имен хоста не настроен.',
  cloudflare_data_missing: 'cloudflare_data отсутствует, проверьте, пожалуйста.',
  cloudflare_unknown_error: 'Получена неизвестная ошибка при запросе к API Cloudflare',
  cloudflare_response_error: 'Получен неожиданный ответ от Cloudflare.',
  limit_to_one_domain: 'Вы можете использовать только один пользовательский домен.',
  hostname_already_exists: 'Этот домен уже существует на нашем сервере.',
  cloudflare_not_found: 'Не удается найти имя хоста в Cloudflare',
  domain_is_not_allowed: 'Этот домен не разрешен.',
};

export default Object.freeze(domain);

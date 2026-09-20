const console_sso = {
  title: 'Console SSO',
  empty_title: 'Безопасный доступ к консоли через SSO',
  empty_description:
    'Добавьте поставщика удостоверений, чтобы команда могла входить в Logto Cloud Console через SSO.',
  scope_description:
    'Console SSO используется для входа в Logto Cloud Console. Он не предоставляет членство в тенантах.',
  resume_creation:
    'Обнаружено незавершённое создание. Продолжите с тем же поставщиком, чтобы восстановить этот коннектор.',
  domain_bound: 'Привязан',
  domain_pending: 'Ожидается проверка DNS',
  back_to_subscription: 'Назад к подписке',
  delete_confirmation:
    'Удалить этот коннектор Console SSO? Пользователи больше не смогут входить с его помощью в Cloud Console.',
};

export default Object.freeze(console_sso);

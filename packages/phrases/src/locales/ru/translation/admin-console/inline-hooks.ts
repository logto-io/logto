const inline_hooks = {
  page_title: 'Inline-хуки',
  title: 'Inline-хуки',
  subtitle:
    'Запускайте пользовательский код в определённых точках процесса аутентификации, чтобы расширить поведение Logto.',
  status: {
    not_configured: 'Не настроено',
    configured: 'Настроено',
    enabled: 'Включено',
    disabled: 'Отключено',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'После проверки первого фактора',
      description:
        'Запускайте пользовательскую логику после проверки первого фактора аутентификации и до продолжения входа.',
    },
    post_sign_in: {
      name: 'После входа',
      description: 'Запускайте пользовательскую логику после успешного входа пользователя.',
    },
  },
};

export default Object.freeze(inline_hooks);

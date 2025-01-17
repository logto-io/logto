const mfa = {
  title: 'Многократная аутентификация',
  description:
    'Добавьте многократную аутентификацию, чтобы повысить безопасность вашего опыта входа в систему.',
  factors: 'Факторы',
  multi_factors: 'Множественные факторы',
  multi_factors_description:
    'Пользователям необходимо проверить один из включенных факторов для двухэтапной верификации.',
  totp: 'OTP приложения аутентификации',
  otp_description: 'Привяжите Google Authenticator и др., чтобы проверять одноразовые пароли.',
  webauthn: 'WebAuthn (Пароль)',
  webauthn_description:
    'Проверьте через метод, поддерживаемый браузером: биометрия, сканирование телефона или ключ безопасности и т.д.',
  webauthn_native_tip: 'WebAuthn не поддерживается для приложений Native.',
  webauthn_domain_tip:
    'WebAuthn привязывает открытые ключи к конкретному домену. Изменение домена службы блокирует пользователей от аутентификации через существующие пароли.',
  backup_code: 'Резервный код',
  backup_code_description:
    'Генерируйте 10 одноразовых резервных кодов после настройки любого метода MFA.',
  backup_code_setup_hint:
    'Когда пользователи не могут проверить вышеупомянутые факторы MFA, используйте резервный вариант.',
  backup_code_error_hint:
    'Для использования резервного кода вам нужен как минимум еще один метод MFA для успешной аутентификации пользователя.',
  policy: 'Политика',
  policy_description: 'Установите политику MFA для процессов входа и регистрации.',
  two_step_sign_in_policy: 'Политика двухэтапной верификации при входе',
  user_controlled: 'Пользователи могут самостоятельно включать или отключать MFA',
  user_controlled_tip:
    'Пользователи могут пропустить настройку MFA при первом входе или регистрации, либо включить/отключить его в настройках учетной записи.',
  mandatory: 'Пользователям всегда нужно использовать MFA при входе',
  mandatory_tip:
    'Пользователи должны настроить MFA при первом входе или регистрации и использовать его для всех последующих входов.',
  /** UNTRANSLATED */
  require_mfa: 'Require MFA',
  /** UNTRANSLATED */
  require_mfa_label:
    'Enable this to make 2-step verification mandatory for accessing your applications. If disabled, users can decide whether to enable MFA for themselves.',
  /** UNTRANSLATED */
  set_up_prompt: 'MFA set-up prompt',
  /** UNTRANSLATED */
  no_prompt: 'Do not ask users to set up MFA',
  /** UNTRANSLATED */
  prompt_at_sign_in_and_sign_up:
    'Ask users to set up MFA during registration (skippable, one-time prompt)',
  /** UNTRANSLATED */
  prompt_only_at_sign_in:
    'Ask users to set up MFA on their next sign-in attempt after registration (skippable, one-time prompt)',
};

export default Object.freeze(mfa);

const mfa = {
  title: '多要素認証',
  description:
    'サインインエクスペリエンスのセキュリティを向上させるために、多要素認証を追加します。',
  factors: '要因',
  multi_factors: 'マルチファクター',
  multi_factors_description:
    'ユーザーは2段階認証のために有効になっている要因の1つを確認する必要があります。',
  totp: 'AuthenticatorアプリOTP',
  otp_description: 'Google Authenticatorなどをリンクしてワンタイムパスワードを確認します。',
  /** UNTRANSLATED */
  webauthn: 'WebAuthn(Passkey)',
  /** UNTRANSLATED */
  webauthn_description:
    'Verify via browser-supported method: biometrics, phone scanning, or security key, etc.',
  /** UNTRANSLATED */
  webauthn_native_tip: 'WebAuthn is not supported for Native applications.',
  /** UNTRANSLATED */
  webauthn_domain_tip:
    'WebAuthn binds public keys to the specific domain. Modifying your service domain will block users from authenticating via existing passkeys.',
  backup_code: 'バックアップコード',
  backup_code_description: '1回の認証に使用できる10個のユニークなコードを生成します。',
  backup_code_setup_hint: '単独で有効化できないバックアップ認証要因：',
  backup_code_error_hint:
    'MFAのバックアップコードを使用するには、他の要因を有効にする必要があり、ユーザーのサインインが成功することを確認します。',
  policy: 'ポリシー',
  two_step_sign_in_policy: 'サインイン時の2段階認証ポリシー',
  user_controlled: 'ユーザーは個人でMFAを有効にする選択肢があります。',
  mandatory: 'すべてのユーザーに対するすべてのサインインでの義務MFA。',
  unlock_reminder:
    'セキュリティの確認のためにMFAをロック解除して有料プランにアップグレードします。サポートが必要な場合はお気軽に<a>お問い合わせ</a>ください。',
  view_plans: 'プランを表示',
};

export default Object.freeze(mfa);

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
  webauthn: 'WebAuthn',
  webauthn_description:
    'WebAuthnはYubiKeyを含むユーザーのデバイスを確認するためにパスキーを使用します。',
  backup_code: 'バックアップコード',
  backup_code_description: '1回の認証に使用できる10個のユニークなコードを生成します。',
  backup_code_setup_hint: '単独で有効化できないバックアップ認証要因：',
  backup_code_error_hint:
    'MFAのバックアップコードを使用するには、他の要因を有効にする必要があり、ユーザーのサインインが成功することを確認します。',
  policy: 'ポリシー',
  two_step_sign_in_policy: 'サインイン時の2段階認証ポリシー',
  two_step_sign_in_policy_description: 'サインイン時のアプリ全体の2段階認証要件を定義します。',
  user_controlled: 'ユーザーがコントロール',
  user_controlled_description:
    'デフォルトでは無効で、強制ではありませんが、ユーザーは個別に有効にできます。',
  mandatory: '必須',
  mandatory_description: 'すべてのユーザーに対してすべてのサインインでMFAが必要です。',
  unlock_reminder:
    'セキュリティの確認のためにMFAをロック解除して有料プランにアップグレードします。サポートが必要な場合はお気軽に<a>お問い合わせ</a>ください。',
  view_plans: 'プランを表示',
};

export default Object.freeze(mfa);
